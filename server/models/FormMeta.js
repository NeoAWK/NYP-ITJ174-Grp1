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
     slug: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true,
      validate: {
        is: /^[a-z0-9-]+$/i, // Only letters, numbers, hyphens
      }
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
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
    timestamps: true
  });

  return FormMeta;
};