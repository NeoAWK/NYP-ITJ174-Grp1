const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();

// One single consolidated model import
const { User, TrainingProvider, TrainerProfile, LearnerProfile } = require('../models');

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
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: email,
        subject: "Verify your email",
        html: `<p>Please click the link below to verify your email:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>`
    });
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

        data.password = await bcrypt.hash(data.password, 10);
        data.verificationToken = crypto.randomBytes(32).toString('hex');
        data.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

        let result = await User.create(data);
        await sendVerificationEmail(result.email, result.verificationToken);

        res.json({ message: `User ${result.email} was registered successfully. Please verify your email.` });
    } catch (err) {
        res.status(400).json({ errors: err.errors });
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

        // Every user can independently hold a Training Provider, Trainer, and/or
        // Learner registration at the same time. Ensure all three rows exist
        // (findOrCreate) and return them all under "profiles", keyed by role,
        // so status can be checked per-role regardless of which one is currently
        // "active" (user.usertype).
        const [trainingProviderProfile] = await TrainingProvider.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } });
        const [trainerProfile] = await TrainerProfile.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } });
        const [learnerProfile] = await LearnerProfile.findOrCreate({ where: { userId: user.id }, defaults: { userId: user.id } });

        // "details" kept for backward compatibility — mirrors whichever profile
        // matches the user's current usertype, same as before this change.
        let details = null;
        if (user.usertype === 'Training Provider') details = trainingProviderProfile;
        else if (user.usertype === 'Trainer') details = trainerProfile;
        else if (user.usertype === 'Learner') details = learnerProfile;

        res.json({
            user: { id: user.id, name: user.name, usertype: user.usertype },
            details,
            profiles: {
                trainingProvider: trainingProviderProfile,
                trainer: trainerProfile,
                learner: learnerProfile
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profiles", error: err });
    }
});

// PUT: Upsert Ecosystem Profile Extensions
// Uses an explicit "role" sent by the registration form to decide which
// profile table to write to, and promotes the user's usertype to match.
// Falls back to companyRegistrationId detection, then the user's current
// usertype, for any older frontend calls that don't send "role".
router.put("/ecosystem-profile", validateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const role = req.body.role
            || (req.body.companyRegistrationId ? 'Training Provider' : user.usertype);

        if (role === 'Training Provider') {
            if (user.usertype !== 'Training Provider') {
                await user.update({ usertype: 'Training Provider' });
            }

            await TrainingProvider.upsert({
                userId: user.id,
                name: req.body.name,
                emailAddress: req.body.emailAddress,
                mobileNo: req.body.mobileNo,
                companyRegistrationId: req.body.companyRegistrationId,
                companyAddress: req.body.companyAddress,
                postalCode: req.body.postalCode,
                companyWebsite: req.body.companyWebsite,
                mainFieldOfTraining: req.body.mainFieldOfTraining,
                proofOfCertification: req.body.proofOfCertification
            });

            return res.json({ message: "Training Provider details submitted successfully!" });
        }

        if (role === 'Trainer') {
            if (user.usertype !== 'Trainer') {
                await user.update({ usertype: 'Trainer' });
            }

            await TrainerProfile.upsert({
                userId: user.id,
                name: req.body.name,
                emailAddress: req.body.emailAddress,
                mobileNo: req.body.mobileNo,
                areasOfExpertise: req.body.areasOfExpertise,
                resumeExperience: req.body.resumeExperience
            });

            return res.json({ message: "Trainer details saved successfully!" });
        }

        if (role === 'Learner') {
            if (user.usertype !== 'Learner') {
                await user.update({ usertype: 'Learner' });
            }

            await LearnerProfile.upsert({
                userId: user.id,
                name: req.body.name,
                email: req.body.email || req.body.emailAddress,
                mobileNo: req.body.mobileNo,
                educationQualification: req.body.educationQualification,
                areaOfInterest: req.body.areaOfInterest,
                attachment: req.body.attachment
            });

            return res.json({ message: "Learner details saved successfully!" });
        }

        res.status(400).json({ message: "Invalid user type." });
    } catch (err) {
        console.error("Ecosystem profile error:", err);
        res.status(500).json({ message: "Save failed.", error: err.message });
    }
});
// GET all users
router.get('/',  async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'usertype', 'mobileNo', 'isVerified', 'createdAt', 'updatedAt'] // exclude password
    });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});
// admin.js
router.put('/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, usertype, mobileNo, isVerified } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ name, email, usertype, mobileNo, isVerified });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', validateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy(); // cascades to profile tables
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
