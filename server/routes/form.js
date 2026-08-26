const express = require('express');
const router = express.Router();
const db = require('../models'); // Adjust import to your project structure
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// === SAFEGUARD 1: Define the root directory for ALL form files ===
const FORMS_ROOT_DIR = path.join(__dirname, '../data/formDefinitions');

// Helper: Safely resolve a file path
const getSafeFilePath = (filename) => {
  // Prevent path traversal: only use the base name (strips out '../' or '/')
  const safeName = path.basename(filename);
  return path.join(FORMS_ROOT_DIR, safeName);
};
// ===== PUBLIC: Fetch by Slug (for the Renderer) =====
router.get('/slug/:slug', async (req, res) => {
  try {
    const db = require('../models');
    const formMeta = await db.FormMeta.findOne({
      where: { slug: req.params.slug, isActive: true }
    });

    if (!formMeta) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const fullPath = getSafeFilePath(formMeta.filePath);
    if (!fullPath.startsWith(FORMS_ROOT_DIR)) {
      return res.status(403).json({ error: 'Invalid file path.' });
    }

    try {
      await fs.access(fullPath, fs.constants.F_OK);
    } catch (fileError) {
      return res.status(404).json({ error: 'Form definition file missing.' });
    }

    const fileContent = await fs.readFile(fullPath, 'utf8');
    const schema = yaml.load(fileContent);

    res.json({
      id: formMeta.id,
      name: formMeta.name,
      slug: formMeta.slug,
      version: formMeta.version,
      schema: schema
    });

  } catch (err) { 
    console.error('Error fetching form by slug:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ===== CREATE: Require slug =====
router.post('/', async (req, res) => {
  try {
    const db = require('../models');
    const { name, slug, filePath } = req.body;
    if (!name || !slug || !filePath) {
      return res.status(400).json({ error: 'Name, slug, and filePath are required.' });
    }

    // Check if slug already exists
    const existing = await db.FormMeta.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: 'Slug already in use. Please choose another.' });
    }

    const fullPath = getSafeFilePath(filePath);
    const defaultSchema = { title: name, instructions: 'Please fill in all required fields.', sections: [] };
    const yamlStr = yaml.dump(defaultSchema, { indent: 2, lineWidth: 120 });
    await fs.writeFile(fullPath, yamlStr, 'utf8');

    const newForm = await db.FormMeta.create({ name, slug, filePath, version: 1, isActive: true });
    res.status(201).json(newForm);

  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ error: 'Failed to create form.' });
  }
});

// === GET: Fetch a specific form by ID ===
router.get('/:id', async (req, res) => {
  try {
    const formMeta = await db.FormMeta.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!formMeta) {
      return res.status(404).json({ error: 'Form metadata not found.' });
    }

    // SAFEGUARD 2: Resolve the absolute path safely
    const fullPath = getSafeFilePath(formMeta.filePath);

    // SAFEGUARD 3: Ensure the resolved path is still inside the root (double-check)
    if (!fullPath.startsWith(FORMS_ROOT_DIR)) {
      console.error(`Path traversal attempt detected for file: ${formMeta.filePath}`);
      return res.status(403).json({ error: 'Invalid file path.' });
    }

    // SAFEGUARD 4: Check if the file actually exists on disk
    try {
      await fs.access(fullPath, fs.constants.F_OK);
    } catch (fileError) {
      console.error(`YAML file missing for Form ID ${formMeta.id}. Expected: ${fullPath}`);
      return res.status(404).json({ 
        error: 'Form definition file is missing on the server. Please contact support.' 
      });
    }

    // Read and parse the YAML file
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const schema = yaml.load(fileContent);

    // Return the combined data to the client
    res.json({
      id: formMeta.id,
      name: formMeta.name,
      version: formMeta.version,
      schema: schema // This is the 'questions' structure
    });

  } catch (err) {
    console.error('Error fetching form:', err);
    res.status(500).json({ error: 'Internal server error while fetching form.' });
  }
});

// === PUT: Update (Publish) a specific form ===
router.put('/:id', async (req, res) => {
  try {
    const formMeta = await db.FormMeta.findOne({
      where: { id: req.params.id }
    });

    if (!formMeta) {
      return res.status(404).json({ error: 'Form metadata not found.' });
    }

    const { name, schema } = req.body;

    // Basic validation of the incoming schema
    if (!schema || !schema.sections || !Array.isArray(schema.sections)) {
      return res.status(400).json({ 
        error: 'Invalid schema structure. Must contain a "sections" array.' 
      });
    }

    // SAFEGUARD 5: Resolve the path safely
    const fullPath = getSafeFilePath(formMeta.filePath);
    if (!fullPath.startsWith(FORMS_ROOT_DIR)) {
      return res.status(403).json({ error: 'Invalid file path.' });
    }

    // Convert JSON schema to YAML string
    const yamlStr = yaml.dump(schema, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });

    // SAFEGUARD 6: Atomic Write (write to temp file, then rename)
    const tempPath = `${fullPath}.tmp`;
    await fs.writeFile(tempPath, yamlStr, 'utf8');
    await fs.rename(tempPath, fullPath);

    // Update metadata in SQLite
    formMeta.name = name || formMeta.name;
    formMeta.version = formMeta.version + 1;
    await formMeta.save();

    console.log(`[SUCCESS] Form ID ${formMeta.id} updated to version ${formMeta.version}`);

    res.json({
      message: 'Form published successfully!',
      form: {
        id: formMeta.id,
        name: formMeta.name,
        version: formMeta.version,
        schema: schema
      }
    });

  } catch (err) {
    console.error('Error updating form:', err);
    res.status(500).json({ error: 'Failed to save form definition.' });
  }
});

// GET all forms
router.get('/', async (req, res) => {
  try {
    const db = require('../models');
    const forms = await db.FormMeta.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(forms);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ error: 'Failed to fetch forms.' });
  }
});

// POST create a new form
router.post('/', async (req, res) => {
  try {
    const db = require('../models');
    const { name, filePath } = req.body;
    if (!name || !filePath) {
      return res.status(400).json({ error: 'Name and filePath are required.' });
    }

    // Check if file already exists (optional)
    const fullPath = getSafeFilePath(filePath);
    // We'll create a default schema
    const defaultSchema = {
      title: 'Untitled Form',
      instructions: 'Please fill in all required fields.',
      sections: []
    };
    const yamlStr = yaml.dump(defaultSchema, { indent: 2, lineWidth: 120 });
    await fs.writeFile(fullPath, yamlStr, 'utf8');

    const newForm = await db.FormMeta.create({
      name,
      filePath,
      version: 1,
      isActive: true
    });

    res.status(201).json(newForm);
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ error: 'Failed to create form.' });
  }
});

// DELETE (soft delete – set isActive = false, but keep file)
router.delete('/:id', async (req, res) => {
  try {
    const db = require('../models');
    const form = await db.FormMeta.findOne({ where: { id: req.params.id } });
    if (!form) return res.status(404).json({ error: 'Form not found.' });
    // Soft delete: just deactivate
    form.isActive = false;
    await form.save();
    res.json({ message: 'Form deactivated.' });
  } catch (err) {
    console.error('Error deleting form:', err);
    res.status(500).json({ error: 'Failed to delete form.' });
  }
});

// PATCH toggle active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const db = require('../models');
    const form = await db.FormMeta.findOne({ where: { id: req.params.id } });
    if (!form) return res.status(404).json({ error: 'Form not found.' });
    form.isActive = !form.isActive;
    await form.save();
    res.json(form);
  } catch (err) {
    console.error('Error toggling form:', err);
    res.status(500).json({ error: 'Failed to toggle form.' });
  }
});

module.exports = router;