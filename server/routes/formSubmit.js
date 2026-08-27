const express = require('express');
const router = express.Router();
const db = require('../models');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validateToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const FORMS_ROOT_DIR = path.join(__dirname, '../data/formDefinitions');
const getSafeFilePath = (filename) => {
  const safeName = path.basename(filename);
  return path.join(FORMS_ROOT_DIR, safeName);
};

const buildTableMap = () => {
  const map = {};
  Object.keys(db).forEach((modelKey) => {
    const model = db[modelKey];
    if (!model) return;
    const tableName = model.tableName || modelKey.toLowerCase();
    map[tableName] = modelKey;
  });
  return map;
};

const AUTO_FILL_USER_ID_COLUMNS = {
  'learner_profiles': ['userId'],
  'trainer_profiles': ['userId'],
  'training_providers': ['userId'],
  'Courses': ['TrainerID'],
  'Enrollments': ['userId'],
};

router.post('/:slug', validateToken, upload.any(), async (req, res) => {
  const { slug } = req.params;
  let transaction;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const currentUserId = req.user.id;
    const currentUserType = req.user.usertype;

    console.log(`📝 Form submission for slug: ${slug} by user ${currentUserId}`);

    const formMeta = await db.FormMeta.findOne({ where: { slug, isActive: true } });
    if (!formMeta) {
      return res.status(404).json({ error: 'Form not found or inactive.' });
    }

    const fullPath = getSafeFilePath(formMeta.filePath);
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const formSchema = yaml.load(fileContent);
    if (!formSchema.sections) {
      return res.status(400).json({ error: 'Invalid form schema: no sections.' });
    }

    const responses = { ...req.body };
    const fileMap = {};
    if (req.files && req.files.length) {
      req.files.forEach(file => {
        fileMap[file.fieldname] = file.path;
      });
    }

    const tableData = {};
    formSchema.sections.forEach(section => {
      section.fields.forEach(field => {
        const target = field.target;
        if (!target) return;

        let value = responses[field.id];
        if (field.type === 'file' && fileMap[field.id]) {
          value = fileMap[field.id];
        }

        if (value === undefined || value === null || value === '') {
          return;
        }

        const [table, column] = target.split('.');
        if (!table || !column) {
          console.warn(`Invalid target format: ${target}`);
          return;
        }

        if (!tableData[table]) tableData[table] = {};
        tableData[table][column] = value;
      });
    });

    console.log('📦 tableData:', JSON.stringify(tableData, null, 2));

    if (Object.keys(tableData).length === 0) {
      return res.status(400).json({ error: 'No target fields found in submission.' });
    }

    const tableMap = buildTableMap();

    transaction = await db.sequelize.transaction();
    const createdRecords = {};

    for (const [tableName, columns] of Object.entries(tableData)) {
      const modelKey = tableMap[tableName];
      if (!modelKey) {
        throw new Error(`Table "${tableName}" not found in models.`);
      }

      const model = db[modelKey];
      console.log(`🔍 Processing table: ${tableName} (model: ${modelKey})`);

      let dataForCreate = { ...columns };

      // Auto‑fill primary key if it's userId
      const pkName = Object.keys(model.primaryKeys)[0];
      if (pkName === 'userId' && !dataForCreate.userId) {
        dataForCreate.userId = currentUserId;
        console.log(`   → Auto‑filled userId = ${currentUserId}`);
      }

      // Auto‑fill configured columns
      const columnsToFill = AUTO_FILL_USER_ID_COLUMNS[tableName] || [];
      for (const col of columnsToFill) {
        if (model.rawAttributes[col] && !dataForCreate[col]) {
          dataForCreate[col] = currentUserId;
          console.log(`   → Auto‑filled ${col} = ${currentUserId}`);
        }
      }

      // Special: providerId for trainer_profiles
      if (tableName === 'trainer_profiles' && currentUserType === 'TrainingProvider') {
        if (model.rawAttributes.providerId && !dataForCreate.providerId) {
          dataForCreate.providerId = currentUserId;
          console.log(`   → Auto‑filled providerId = ${currentUserId}`);
        }
      }

      // Filter valid columns
      const validColumns = {};
      Object.keys(dataForCreate).forEach(col => {
        if (model.rawAttributes && model.rawAttributes[col]) {
          validColumns[col] = dataForCreate[col];
        } else {
          console.warn(`   ⚠️ Column "${col}" not found in model "${modelKey}", skipping.`);
        }
      });

      console.log(`   ✅ validColumns:`, validColumns);

      if (Object.keys(validColumns).length === 0) {
        console.warn(`   ⚠️ No valid columns for table "${tableName}". Skipping.`);
        continue;
      }

      // 🔥 NEW: Auto‑generate CourseID if missing
      if (tableName === 'Courses' && !validColumns.CourseID) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        validColumns.CourseID = `CRS-${timestamp}-${random}`;
        console.log(`   → Auto‑generated CourseID: ${validColumns.CourseID}`);
      }

      // --- Upsert ---
      const [instance, created] = await model.upsert(validColumns, { transaction });
      console.log(`   🔄 Upsert result: ${created ? 'created' : 'updated'} record with ${pkName}=${instance[pkName]}`);
      createdRecords[tableName] = instance[pkName];
    }

    // (Optional) Create Application record
    if (db.Application) {
      const appData = {
        submittedAt: new Date(),
        status: 'pending',
        userId: currentUserId,
      };
      if (createdRecords.training_providers) appData.providerId = createdRecords.training_providers;
      if (createdRecords.Courses) appData.courseId = createdRecords.Courses;
      if (createdRecords.trainer_profiles) appData.trainerId = createdRecords.trainer_profiles;
      // Add more mappings as needed

      if (Object.keys(appData).length > 2) {
        const application = await db.Application.create(appData, { transaction });
        createdRecords.application = application.id;
      }
    }

    await transaction.commit();
    console.log(`🎉 Transaction committed successfully.`);

    res.status(201).json({
      message: 'Form submitted successfully.',
      createdRecords,
    });

  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('❌ Error processing form submission:', err);
    res.status(500).json({ error: err.message || 'Failed to process submission.' });
  }
});

module.exports = router;