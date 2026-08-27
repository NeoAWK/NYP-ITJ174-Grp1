const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const { sign } = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
let backendMode = 'database';

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL
}));

// Simple Base Route
app.get('/', (req, res) => {
  res.send('Welcome to the RightSkills ecosystem API.');
});

app.get('/system/mode', (req, res) => {
  res.json({ mode: backendMode });
});

const port = process.env.APP_PORT || 3001;

function registerDatabaseRoutes() {
  const userRoute = require('./routes/user');
  const fileRoute = require('./routes/file');
  const adminRoute = require('./routes/admin');
  const courseRoute = require('./routes/course');
  const formRoute = require('./routes/form'); 
  const submissionsRouter = require('./routes/submission');
  const databaseFieldsRouter = require('./routes/databaseFields');
  const submitRoutes = require('./routes/formSubmit');
  const trainerRoutes = require('./routes/trainer');

  
  if (trainerRoutes) app.use('/trainers', trainerRoutes);
  if (submitRoutes) app.use('/submit-form', submitRoutes);  
  if (databaseFieldsRouter) app.use('/api/database-fields', databaseFieldsRouter);
  if (submissionsRouter) app.use('/submissions', submissionsRouter);
  if (userRoute) app.use('/user', userRoute);
  if (fileRoute) app.use('/file', fileRoute);
  if (adminRoute) app.use('/admin', adminRoute);
  if (courseRoute) app.use('/courses', courseRoute);
  if (formRoute) app.use('/forms', formRoute);  
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

  // Fallback Courses Route
  app.get('/courses', (req, res) => {
    res.json([
      {
        id: 'RS-2026-001',
        title: 'Advanced Data Analytics with Python',
        level: 'Advanced',
        provider: 'TechLearn Academy',
        category: 'Data Science',
        duration: '40 hours',
        submitted: '14 Jul 2026',
        fee: 2500,
        status: 'Pending Review'
      },
      {
        id: 'RS-2026-002',
        title: 'Workplace Health & Safety Fundamentals',
        level: 'Foundation',
        provider: 'SafeWork Training Ltd',
        category: 'Health & Safety',
        duration: '16 hours',
        submitted: '11 Jul 2026',
        fee: 850,
        status: 'Pending Review'
      }
    ]);
  });

  app.get('/admin/logs', (req, res) => {
    res.json([
      {
        id: 1,
        timestamp: new Date().toISOString(),
        adminEmail: 'admin123@abc.com',
        action: 'COURSE_APPROVED',
        targetEntity: 'Customer Experience Design',
        details: 'Approved course submission for Clarity Learning Co. (Placeholder Mode)'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        adminEmail: 'admin123@abc.com',
        action: 'COURSE_REJECTED',
        targetEntity: 'Advanced Data Analytics with Python',
        details: 'Rejection notice sent due to missing syllabus credentials.'
      }
    ]);
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

async function ensureAdminAccount(db) {
  const adminDetails = {
    id: 2000,
    name: 'Admin Account',
    email: 'admin123@abc.com',
    password: 'P@ssw0rd',
    isVerified: true,
    usertype: 'RightSkills'
  };
  const passwordHash = await bcrypt.hash(adminDetails.password, 10);
  const [admin, created] = await db.User.findOrCreate({
    where: { id: adminDetails.id },
    defaults: { ...adminDetails, password: passwordHash }
  });

  if (!created) {
    await admin.update({
      name: adminDetails.name,
      email: adminDetails.email,
      password: passwordHash,
      isVerified: adminDetails.isVerified,
      usertype: adminDetails.usertype
    });
  }

  console.log(`Admin account ${created ? 'created' : 'verified'}: ID ${adminDetails.id}`);
}

async function ensureAdminLogs(db) {
  if (!db.AdminLog) return;

  const count = await db.AdminLog.count();
  if (count === 0) {
    await db.AdminLog.bulkCreate([
      {
        adminEmail: 'admin123@abc.com',
        action: 'COURSE_APPROVED',
        targetEntity: 'Customer Experience Design',
        details: 'Approved course submission for Clarity Learning Co.'
      },
      {
        adminEmail: 'admin123@abc.com',
        action: 'COURSE_REJECTED',
        targetEntity: 'Advanced Data Analytics with Python',
        details: 'Rejection notice sent due to incomplete syllabus structure.'
      },
      {
        adminEmail: 'admin123@abc.com',
        action: 'FORM_UPDATED',
        targetEntity: 'Course Application Form Schema',
        details: 'Updated maximum allowable subsidy rate settings.'
      }
    ]);
    console.log('Sample admin logs initialized in SQLite.');
  }
}

async function ensureTestTrainerAccount(db) {
    const trainerDetails = {
        id: 2001,
        name: 'Test Trainer',
        email: 'test.trainer@rightskills.local',
        password: 'P@ssw0rd',
        isVerified: true,
        usertype: 'Trainer'
    };
    const passwordHash = await bcrypt.hash(trainerDetails.password, 10);
    const [trainer, created] = await db.User.findOrCreate({
        where: { id: trainerDetails.id },
        defaults: { ...trainerDetails, password: passwordHash }
    });

  if (!created) {
    await trainer.update({
      name: trainerDetails.name,
      email: trainerDetails.email,
      password: passwordHash,
      isVerified: trainerDetails.isVerified,
      usertype: trainerDetails.usertype
    });
  }

  if (db.TrainerProfile) {
    await db.TrainerProfile.findOrCreate({
      where: { userId: trainerDetails.id },
      defaults: {
        userId: trainerDetails.id,
        qualifications: 'Diploma in Applied Learning and Development',
        certification: 'Certified Workplace Trainer',
        experience: 'Three years delivering technical and workplace skills training.',
        professionalDevelopment: 'Annual trainer development programme',
        certificationValidity: '2028-12-31'
      }
    });
  }

  console.log(`Test trainer account ${created ? 'created' : 'verified'}: ID ${trainerDetails.id}`);
}

async function ensureTrainerProfileColumns(db) {
  if (db.sequelize.getDialect() !== 'sqlite') {
    return;
  }

  const [columns] = await db.sequelize.query('PRAGMA table_info(trainer_profiles)');
  const existingColumns = new Set(columns.map((column) => column.name));
  const additions = [
    ['experienceEntries', 'TEXT'],
    ['certificateFile', 'VARCHAR(255)'],
    ['certificateFiles', 'TEXT']
  ];

  for (const [name, type] of additions) {
    if (!existingColumns.has(name)) {
      await db.sequelize.query(`ALTER TABLE trainer_profiles ADD COLUMN ${name} ${type}`);
    }
  }
}

// Database Connection & Boot Routine
const db = require('./models');

const syncOptions = db.sequelize.getDialect() === 'sqlite' ? {} : { alter: true };
db.sequelize.sync(syncOptions)
  .then(() => {
    backendMode = 'database';
    if (db.sequelize.getDialect() === 'sqlite') {
      console.log(`SQLite database ready at ${db.sequelize.options.storage}`);
    }
    return ensureAdminAccount(db);
  })
  .then(() => {
    return ensureAdminLogs(db);
  })
  .then(() => {
    return ensureTrainerProfileColumns(db);
  })
  .then(() => {
    return ensureTestTrainerAccount(db);
  })
 
  .then(() => {
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