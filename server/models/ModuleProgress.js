module.exports = (sequelize, DataTypes) => {
  const ModuleProgress = sequelize.define('ModuleProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    enrollmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'enrollments', key: 'id' },
      onDelete: 'CASCADE'
    },
    moduleId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'modules', key: 'ModuleID' },
      onDelete: 'CASCADE'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'module_progress',
    timestamps: true
  });

  ModuleProgress.associate = (models) => {
    ModuleProgress.belongsTo(models.Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });
    ModuleProgress.belongsTo(models.Module, { foreignKey: 'moduleId', as: 'module' });
  };

  return ModuleProgress;
};