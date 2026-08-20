'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const db = {};
require('dotenv').config();

const configuredDialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();
let sequelize;

if (configuredDialect === 'sqlite') {
  const sqliteStorage = process.env.SQLITE_STORAGE || path.join(__dirname, '..', 'data', 'rightskills.sqlite');
  fs.mkdirSync(path.dirname(sqliteStorage), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PWD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: configuredDialect,
      logging: false,
      timezone: '+08:00'
    }
  );
}

// Safely filter and load ONLY Sequelize model definitions
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.toLowerCase().includes('route') &&
      !file.toLowerCase().includes('controller')
    );
  })
  .forEach(file => {
    const modelModule = require(path.join(__dirname, file));
    if (typeof modelModule === 'function') {
      const model = modelModule(sequelize, Sequelize.DataTypes);
      if (model && model.name) {
        db[model.name] = model;
      }
    }
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define core relationships safely
if (db.Course && db.Module) {
  db.Course.hasMany(db.Module, { foreignKey: 'CourseID', onDelete: 'CASCADE' });
  db.Module.belongsTo(db.Course, { foreignKey: 'CourseID' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;