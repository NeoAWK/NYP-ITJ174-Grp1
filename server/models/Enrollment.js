module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define('Enrollment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'Courses', key: 'CourseID' },
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('Enrolled', 'In Progress', 'Completed'),
      defaultValue: 'Enrolled'
    },
    enrolledAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'enrollments',
    timestamps: true
  });

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Enrollment.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
    Enrollment.hasMany(models.ModuleProgress, { foreignKey: 'enrollmentId', as: 'moduleProgress' });
  };

  return Enrollment;
};