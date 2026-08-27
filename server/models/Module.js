const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Module = sequelize.define('Module', {
    ModuleID: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    CourseID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'CourseID'
      }
    },
    ModuleTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ModuleDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    EstimatedHours: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    OrderSequence: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'modules',
    timestamps: true
  });

  return Module;
};