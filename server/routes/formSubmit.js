const express = require('express');
const router = express.Router();
const db = require('../models');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// --- Multer config ---
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

// --- Safe file path helper (reuse from your forms router) ---
const FORMS_ROOT_DIR = path.join(__dirname, '../data/formDefinitions');
const getSafeFilePath = (filename) => {
  const safeName = path.basename(filename);
  return path.join(FORMS_ROOT_DIR, safeName);
};

// --- Build a map from table name (as set in model) to model key ---
const buildTableMap = () => {
  const map = {};
  Object.keys(db).forEach((modelKey) => {
    const model = db[modelKey];
    if (!model) return;
    // Use the tableName if defined, else fallback to modelKey (lowercased)
    const tableName = model.tableName || modelKey.toLowerCase();
    map[tableName] = modelKey;
  });
  return map;
};

// POST /submit-form/:slug
router.post('/:slug', upload.any(), async (req, res) => {
  const { slug } = req.params;
  let transaction;

  try {
    // 1. Find form metadata
    const formMeta = await db.FormMeta.findOne({ where: { slug, isActive: true } });
    if (!formMeta) {
      return res.status(404).json({ error: 'Form not found or inactive.' });
    }

    // 2. Load YAML schema
    const fullPath = getSafeFilePath(formMeta.filePath);
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const formSchema = yaml.load(fileContent);
    if (!formSchema.sections) {
      return res.status(400).json({ error: 'Invalid form schema: no sections.' });
    }

    // 3. Parse text fields + files
    const responses = { ...req.body };
    const fileMap = {};
    if (req.files && req.files.length) {
      req.files.forEach(file => {
        fileMap[file.fieldname] = file.path;
      });
    }

    // 4. Build update objects per table
    const tableData = {}; // { tableName: { column: value, ... } }

    formSchema.sections.forEach(section => {
      section.fields.forEach(field => {
        const target = field.target;
        if (!target) return;

        let value = responses[field.id];
        if (field.type === 'file' && fileMap[field.id]) {
          value = fileMap[field.id];
        }

        if (value === undefined || value === null || value === '') {
          return; // skip empty values (or handle required later)
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

    if (Object.keys(tableData).length === 0) {
      return res.status(400).json({ error: 'No target fields found in submission.' });
    }

    // 5. Build tableName -> modelKey map
    const tableMap = buildTableMap();

    // 6. Start transaction
    transaction = await db.sequelize.transaction();

    const createdRecords = {};

    // 7. Process each table
    for (const [tableName, columns] of Object.entries(tableData)) {
      const modelKey = tableMap[tableName];
      if (!modelKey) {
        const available = Object.keys(tableMap).join(', ');
        throw new Error(
          `Table "${tableName}" not found in models. ` +
          `Available tables: ${available || 'none'}. ` +
          `Check your model's tableName attribute.`
        );
      }

      const model = db[modelKey];
      // Optional: verify columns exist (skip if you trust the mapping)
      // For safety, we can filter columns that exist in model.rawAttributes
      const validColumns = {};
      Object.keys(columns).forEach(col => {
        if (model.rawAttributes && model.rawAttributes[col]) {
          validColumns[col] = columns[col];
        } else {
          console.warn(`Column "${col}" not found in model "${modelKey}", skipping.`);
        }
      });

      if (Object.keys(validColumns).length === 0) {
        console.warn(`No valid columns for table "${tableName}".`);
        continue;
      }

      const newRecord = await model.create(validColumns, { transaction });
      createdRecords[tableName] = newRecord.id;
    }

    // 8. (Optional) Create a master Application record if your app has one
    if (db.Application) {
      const appData = {
        submittedAt: new Date(),
        status: 'pending',
      };
      // Map known table names to foreign keys in Application
      if (createdRecords.training_providers) {
        appData.providerId = createdRecords.training_providers;
      }
      if (createdRecords.courses) {
        appData.courseId = createdRecords.courses;
      }
      if (createdRecords.trainers) {
        appData.trainerId = createdRecords.trainers;
      }
      // Add more mappings as needed

      if (Object.keys(appData).length > 2) { // has more than submittedAt/status
        const application = await db.Application.create(appData, { transaction });
        createdRecords.application = application.id;
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: 'Form submitted successfully. Data saved to respective tables.',
      createdRecords,
    });

  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error processing form submission:', err);
    res.status(500).json({ error: err.message || 'Failed to process submission.' });
  }
});

module.exports = router;