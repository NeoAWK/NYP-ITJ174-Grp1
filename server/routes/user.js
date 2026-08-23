const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validateToken } = require('../middlewares/auth');
const { cleanupNonPersistentUsers, ensurePersistentTestUsers } = require('../utils/persistentUsers');
require('dotenv').config();

// One single consolidated model import
const { User, TrainingProvider, TrainerProfile, LearnerProfile } = require('../models');

const isSmtpDisabled = () => String(process.env.DISABLE_SMTP_EMAIL || 'false').toLowerCase() === 'true';

const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `\"${process.env.EMAIL_FROM_NAME}\" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: email,
        subject: "Verify your email",
        html: `<p>Please click the link below to verify your email:</p>
               <a href=\"${verificationUrl}\">${verificationUrl}</a>`
    });
};

const getLearnerProgressStatus = (profile) => {
    if (profile.completed) return 'completed';
    if (profile.inProgress) return 'in_progress';
    return 'not_started';
};

// POST: Register a new user
router.post("/register", async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        name: yup.string().trim().min(3).max(50).required(),
        email: yup.string().trim().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required(),
        usertype: yup.string().oneOf(['RightSkills', 'Training Provider', 'Trainer', 'Learner']).default('Learner')
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        let user = await User.findOne({ where: { email: data.email } });
        if (user) {
            res.status(400).json({ message: "Email already exists." });
            return;
        }

        const transaction = await User.sequelize.transaction();
        const smtpDisabled = isSmtpDisabled();

        data.password = await bcrypt.hash(data.password, 10);
        if (smtpDisabled) {
            data.isVerified = true;
            data.verificationToken = null;
            data.verificationTokenExpires = null;
        } else {
            data.verificationToken = crypto.randomBytes(32).toString('hex');
            data.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
        }

        try {
            let result = await User.create(data, { transaction });
            if (!smtpDisabled) {
                await sendVerificationEmail(result.email, result.verificationToken);
            }
            await transaction.commit();

            if (smtpDisabled) {
                return res.json({ message: `User ${result.email} was registered and auto-verified (SMTP disabled).` });
            }

            res.json({ message: `User ${result.email} was registered successfully. Please verify your email.` });
        } catch (err) {
            await transaction.rollback();
            console.error('Registration failed, transaction rolled back:', err.message);
            return res.status(503).json({
                message: 'Registration service temporarily unavailable. Please try again later.'
            });
        }
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ errors: err.errors });
        }

        res.status(500).json({ message: 'Registration failed.' });
    }
});

// POST: Verify Email
router.post("/verify-email", async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ where: { verificationToken: token } });
        if (!user) return res.status(400).json({ message: "Invalid link." });
        if (user.verificationTokenExpires < Date.now()) return res.status(400).json({ message: "Expired link." });

        await user.update({ isVerified: true, verificationToken: null, verificationTokenExpires: null });
        res.json({ message: "Email verified successfully!" });
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST: Login
router.post("/login", async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        email: yup.string().trim().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required()
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        let user = await User.findOne({ where: { email: data.email } });
        if (!user) return res.status(400).json({ message: "Email or password wrong." });

        let match = await bcrypt.compare(data.password, user.password);
        if (!match) return res.status(400).json({ message: "Email or password wrong." });

        if (isSmtpDisabled() && !user.isVerified) {
            await user.update({
                isVerified: true,
                verificationToken: null,
                verificationTokenExpires: null
            });
            user.isVerified = true;
        }

        let userInfo = { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, usertype: user.usertype };
        let accessToken = sign({ user: userInfo }, process.env.APP_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({ accessToken: accessToken, user: userInfo });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

// GET: Auth Check
router.get("/auth", validateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, mobileNo: user.mobileNo, profilePicture: user.profilePicture, usertype: user.usertype } });
    } catch (err) {
        res.status(500).json(err);
    }
});

// PUT: Update Base Profile
router.put("/update", validateToken, async (req, res) => {
    let data = req.body;
    let validationSchema = yup.object({
        mobileNo: yup.string().trim()
            .transform((value, originalValue) => originalValue === '' ? null : value)
            .nullable()
            .matches(/^[0-9]+$/, "Only numbers allowed")
            .min(8)
            .max(15)
    });
    try {
        data = await validationSchema.validate(data, { abortEarly: false });
        const user = await User.findByPk(req.user.id);
        await user.update({ mobileNo: data.mobileNo, profilePicture: req.body.profilePicture });
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});

// GET: Ecosystem Profile Extensions
router.get("/ecosystem-profile", validateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        let profileData = { user: { id: user.id, name: user.name, usertype: user.usertype }, details: null };

        if (user.usertype === 'Training Provider') {
            profileData.details = await TrainingProvider.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } }).then(([rec]) => rec);
        } else if (user.usertype === 'Trainer') {
            profileData.details = await TrainerProfile.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } }).then(([rec]) => rec);
        } else if (user.usertype === 'Learner') {
            profileData.details = await LearnerProfile.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } }).then(([rec]) => rec);
        }
        res.json(profileData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profiles", error: err });
    }
});

// PUT: Upsert Ecosystem Profile Extensions
router.put("/ecosystem-profile", validateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user.usertype === 'Training Provider') {
            await TrainingProvider.upsert({ userId: user.id, ...req.body });
        } else if (user.usertype === 'Trainer') {
            await TrainerProfile.upsert({ userId: user.id, ...req.body });
        } else if (user.usertype === 'Learner') {
            await LearnerProfile.upsert({ userId: user.id, ...req.body });
        }
        res.json({ message: "Ecosystem details saved." });
    } catch (err) {
        res.status(400).json({ message: "Save failed.", error: err });
    }
});

// GET: Learner Dashboard
router.get('/learner-dashboard', validateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.usertype !== 'Learner') {
            return res.status(403).json({ message: 'Learner dashboard is only available for learner accounts.' });
        }

        const [learnerProfile] = await LearnerProfile.findOrCreate({
            where: { userId: user.id },
            defaults: { userId: user.id }
        });

        const progressStatus = getLearnerProgressStatus(learnerProfile);
        const completionPercent = progressStatus === 'completed' ? 100 : progressStatus === 'in_progress' ? 50 : 0;

        return res.json({
            learner: {
                id: user.id,
                name: user.name,
                email: user.email,
                usertype: user.usertype,
                isVerified: user.isVerified
            },
            dashboard: {
                enrolledCourse: learnerProfile.enrolledCourse || '',
                moduleHours: learnerProfile.moduleHours || 0,
                statusFlags: {
                    notStarted: Boolean(learnerProfile.notStarted),
                    inProgress: Boolean(learnerProfile.inProgress),
                    completed: Boolean(learnerProfile.completed)
                },
                progressStatus,
                completionPercent
            }
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error loading learner dashboard.', error: err.message });
    }
});

// DELETE: Remove all non-persistent users (admin-only)
router.delete('/admin/non-persistent-users', validateToken, async (req, res) => {
    try {
        const requester = await User.findByPk(req.user.id);
        if (!requester || requester.email !== 'admin123@abc.com') {
            return res.status(403).json({ message: 'Only the test admin account can run this action.' });
        }

        await ensurePersistentTestUsers(User, TrainerProfile);
        const cleanupResult = await cleanupNonPersistentUsers(User);
        res.json({
            message: `Removed ${cleanupResult.deletedCount} non-persistent account(s).`,
            remainingUsers: cleanupResult.remainingUsers
        });
    } catch (err) {
        res.status(500).json({ message: 'Cleanup failed.', error: err.message });
    }
});

module.exports = router;