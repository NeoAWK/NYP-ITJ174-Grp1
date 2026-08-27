const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/', async (req, res) => {
  try {
    const fields = [];

    Object.keys(db).forEach((modelName) => {
      const model = db[modelName];
      if (!model || typeof model.rawAttributes !== 'object') return;

      const tableName = model.tableName || model.name;

      Object.keys(model.rawAttributes).forEach((attrName) => {
        const attr = model.rawAttributes[attrName];
        fields.push({
          value: `${tableName}.${attrName}`,
          label: `${tableName} → ${attrName}`,
          table: tableName,
          column: attrName,
          type: attr.type ? attr.type.key || 'unknown' : 'unknown',
        });
      });
    });

    fields.sort((a, b) => a.value.localeCompare(b.value));
    res.json(fields);
  } catch (err) {
    console.error('Error fetching database fields:', err);
    res.status(500).json({ error: 'Failed to retrieve database schema.' });
  }
});

module.exports = router;