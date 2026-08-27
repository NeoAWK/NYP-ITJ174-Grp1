// server/models/FormMeta.js
module.exports = (sequelize, DataTypes) => {
  const FormMeta = sequelize.define('FormMeta', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Untitled Form'
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      // Example: "accreditation_2025.yaml"
      comment: 'Relative filename inside /data/forms/'
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'FormMetas',
    timestamps: true // Adds createdAt and updatedAt
  });

  return FormMeta;
};