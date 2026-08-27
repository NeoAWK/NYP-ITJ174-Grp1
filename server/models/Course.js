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
    },
    TrainerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      field: 'TrainerID'   // maps to the actual column name in the DB
    },
    // ---------- NEW FIELDS ----------
    CourseLevel: {
      type: DataTypes.STRING(255),
      defaultValue: 'Foundation',
      field: 'CourseLevel'   // optional, but explicit
    },
    Category: {
      type: DataTypes.STRING(255),
      defaultValue: 'General',
      field: 'Category'
    },
    Duration: {
      type: DataTypes.STRING(100),
      defaultValue: 'N/A',
      field: 'Duration'
    },
    CourseFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00,
      field: 'CourseFee'
    }
    // --------------------------------
  }, {
    tableName: 'Courses',
    timestamps: true,   // createdAt & updatedAt are automatically added
    // optional: you can set underscored: false if you prefer camelCase
  });

  // Association: a Course belongs to a Trainer (User)
  Course.associate = function(models) {
    Course.belongsTo(models.User, {
      foreignKey: 'TrainerId',   // points to the model's TrainerId field
      as: 'trainer'              // optional alias for eager loading
    });
  };

  return Course;
};