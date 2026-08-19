const express = require('express');
const cors = require('cors');
const { sign } = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
let backendMode = 'database';

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL
}));

// Simple Route
app.get("/", (req, res) => {
    res.send("Welcome to the RightSkills ecosystem API.");
});

app.get('/system/mode', (req, res) => {
    res.json({ mode: backendMode });
});

const port = process.env.APP_PORT || 3001;

function registerDatabaseRoutes() {
    const tutorialRoute = require('./routes/tutorial');
    const userRoute = require('./routes/user');
    const fileRoute = require('./routes/file');

    app.use('/tutorial', tutorialRoute);
    app.use('/user', userRoute);
    app.use('/file', fileRoute);
}

function registerPlaceholderRoutes() {
    const tempUser = {
        id: 9000,
        email: 'temp@rightskills.local',
        name: 'Temp Account',
        isVerified: true,
        mobileNo: '',
        profilePicture: null,
        usertype: 'RightSkills'
    };
    const tempPassword = 'TempPass123!';

    // RightSkills Officer User Credentials
    const officerUser = {
        id: 9001,
        email: 'admin123@abc.com',
        name: 'RightSkills Officer',
        isVerified: true,
        mobileNo: '',
        profilePicture: null,
        usertype: 'RightSkills'
    };
    const officerPassword = 'test123';

    const placeholderTutorials = [
        {
            id: 1,
            title: 'Backend Placeholder Learning Content',
            description: 'This is sample content shown while backend database setup is disabled.',
            createdAt: new Date().toISOString(),
            user: { name: 'System Placeholder' }
        }
    ];

    app.get('/tutorial', (req, res) => {
        res.json(placeholderTutorials);
    });

    app.get('/tutorial/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        const tutorial = placeholderTutorials.find((item) => item.id === id);
        if (!tutorial) {
            return res.status(404).json({ message: 'Placeholder content item not found.' });
        }
        return res.json(tutorial);
    });

    app.post('/tutorial', (req, res) => {
        res.status(503).json({ message: 'Content creation is unavailable in placeholder backend mode.' });
    });

    app.put('/tutorial/:id', (req, res) => {
        res.status(503).json({ message: 'Content editing is unavailable in placeholder backend mode.' });
    });

    app.delete('/tutorial/:id', (req, res) => {
        res.status(503).json({ message: 'Content deletion is unavailable in placeholder backend mode.' });
    });

    app.get('/user/auth', (req, res) => {
        res.json({ user: officerUser });
    });

    app.get('/user/ecosystem-profile', (req, res) => {
        res.json({
            user: { id: officerUser.id, name: officerUser.name, usertype: officerUser.usertype },
            details: {
                orgDetails: 'RightSkills Governance Officer',
                companyRegistrationId: 'RS-OFFICER-01',
                telephoneNo: '',
                emailAddress: officerUser.email,
                accreditationStatus: 'Active',
                qualifications: 'Course Administration',
                certification: 'RightSkills Officer Certificate',
                experience: 'System Admin',
                professionalDevelopment: 'Active',
                certificationValidity: '2030-12-31',
                enrolledCourse: 'N/A',
                moduleHours: 0,
                notStarted: false,
                inProgress: false,
                completed: true
            }
        });
    });

    app.put('/user/ecosystem-profile', (req, res) => {
        res.json({ message: 'Placeholder save successful (not persisted).' });
    });

    app.post('/user/login', (req, res) => {
        const { email, password } = req.body || {};
        const normalizedEmail = (email || '').trim().toLowerCase();
        const normalizedPassword = (password || '').trim();

        let authenticatedUser = null;

        if (normalizedEmail === officerUser.email.toLowerCase() && normalizedPassword === officerPassword) {
            authenticatedUser = officerUser;
        } else if (normalizedEmail === tempUser.email.toLowerCase() && normalizedPassword === tempPassword) {
            authenticatedUser = tempUser;
        }

        if (!authenticatedUser) {
            return res.status(400).json({ message: 'Email or password wrong.' });
        }

        const secret = process.env.APP_SECRET || 'placeholder-secret';
        const expiresIn = process.env.TOKEN_EXPIRES_IN || '1d';
        const accessToken = sign({ user: authenticatedUser }, secret, { expiresIn });
        return res.json({ accessToken, user: authenticatedUser });
    });

    app.post('/user/register', (req, res) => {
        res.status(503).json({ message: 'Registration is unavailable in placeholder backend mode.' });
    });

    app.post('/user/verify-email', (req, res) => {
        res.status(503).json({ message: 'Email verification is unavailable in placeholder backend mode.' });
    });

    app.put('/user/update', (req, res) => {
        res.status(503).json({ message: 'Profile updates are unavailable in placeholder backend mode.' });
    });

    app.post('/file/upload', (req, res) => {
        res.status(503).json({ message: 'File uploads are unavailable in placeholder backend mode.' });
    });
}

function startServer() {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

const hasDbConfig = ['DB_NAME', 'DB_USER', 'DB_PWD', 'DB_HOST', 'DB_PORT']
    .every((key) => Boolean(process.env[key]));

if (!hasDbConfig) {
    backendMode = 'placeholder';
    console.warn('DB config missing. Starting server without database setup.');
    registerPlaceholderRoutes();
    startServer();
} else {
    const db = require('./models');
    db.sequelize.sync({ alter: true })
        .then(() => {
            backendMode = 'database';
            registerDatabaseRoutes();
            startServer();
        })
        .catch((err) => {
            backendMode = 'placeholder';
            console.error('Database connection failed. Starting server without database setup.');
            console.error(err);
            registerPlaceholderRoutes();
            startServer();
        });
}