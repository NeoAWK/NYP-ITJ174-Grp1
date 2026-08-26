const express = require('express');
const router = express.Router();
const db = require('../models');
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { validateToken } = require('../middlewares/auth');

// Helper to get form schema by slug
const getFormBySlug = async (slug) => {
  const formMeta = await db.FormMeta.findOne({ where: { slug, isActive: true } });
  if (!formMeta) throw new Error('Form not found');
  const fullPath = path.join(__dirname, '../data/formDefinitions', path.basename(formMeta.filePath));
  const fileContent = await fs.readFile(fullPath, 'utf8');
  const schema = yaml.load(fileContent);
  return { formMeta, schema };
};

// Main submission endpoint (authenticated)
router.post('/', validateToken, async (req, res) => {
  const { formSlug, responses } = req.body;
  if (!formSlug) {
    return res.status(400).json({ error: 'formSlug is required' });
  }

  const currentUserId = req.user.id; // from auth middleware

  try {
    // 1. Get form definition
    const { formMeta, schema } = await getFormBySlug(formSlug);

    // 2. Prepare grouped data by table, with User ID override
    const tableData = {};
    for (const section of schema.sections) {
      for (const field of section.fields) {
        if (!field.target) continue;
        const [tableName, columnName] = field.target.split('.');
        if (!tableName || !columnName) {
          console.warn(`Invalid target format for field ${field.id}: ${field.target}`);
          continue;
        }
        let value = responses[field.id] ?? null;

        // If the target is Users.id, force it to the current user's ID
        if (tableName === 'Users' && columnName === 'id') {
          value = currentUserId;
        }

        if (!tableData[tableName]) tableData[tableName] = {};
        tableData[tableName][columnName] = value;
      }
    }

    // 3. Process each table in a transaction
    const transaction = await db.sequelize.transaction();
    let providerId = null;
    let trainerId = null;

    try {
      // 3a. Handle training_providers (if any)
      if (tableData.training_providers) {
        const providerData = tableData.training_providers;
        let provider;
        if (providerData.uen) {
          provider = await db.training_providers.findOne({
            where: { uen: providerData.uen },
            transaction
          });
        }
        if (provider) {
          await provider.update(providerData, { transaction });
        } else {
          provider = await db.training_providers.create(providerData, { transaction });
        }
        providerId = provider.id;
      }

      // 3b. Handle trainer_profiles
      if (tableData.trainer_profiles) {
        const trainerData = tableData.trainer_profiles;
        const trainer = await db.trainer_profiles.create(trainerData, { transaction });
        trainerId = trainer.id;
      }

      // 3c. Handle Courses
      if (tableData.Courses) {
        const courseData = {
          ...tableData.Courses,
          user_id: currentUserId,   // <-- store who submitted
          provider_id: providerId || null,
          trainer_id: trainerId || null,
          SubmissionStatus: tableData.Courses.SubmissionStatus || 'Pending',
          IsActive: tableData.Courses.IsActive ?? 0,
          ApprovalDate: tableData.Courses.ApprovalDate || null,
          ApprovalExpiryDate: tableData.Courses.ApprovalExpiryDate || null,
        };
        const course = await db.Courses.create(courseData, { transaction });

      }

      await transaction.commit();
      res.status(201).json({ message: 'Submission saved successfully' });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to process submission' });
  }
});

module.exports = router;