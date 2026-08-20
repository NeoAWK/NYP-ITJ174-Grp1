module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    CourseID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    CourseTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    SubmissionStatus: {
      type: DataTypes.STRING,
      defaultValue: 'Pending'
    },
    ApprovalDate: {
      type: DataTypes.DATE
    },
    ApprovalExpiryDate: {
      type: DataTypes.DATE
    },
    IsActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return Course;
};