module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        mobileNo: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        profilePicture: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        verificationToken: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        verificationTokenExpires: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // Requirement 3: Added Usertype field to the users table
        usertype: {
            type: DataTypes.ENUM('RightSkills', 'Training Provider', 'Trainer', 'Learner'),
            allowNull: false,
            defaultValue: 'Learner'
        }
    }, {
        tableName: 'users'
    });

    User.associate = (models) => {
        // Requirement 4, 5, 6: Establish relationships to new sub-profile ecosystem tables using the User ID
        if (models.TrainingProvider) {
            User.hasOne(models.TrainingProvider, { foreignKey: "userId", as: "providerProfile", onDelete: "cascade" });
        }
        if (models.TrainerProfile) {
            User.hasOne(models.TrainerProfile, { foreignKey: "userId", as: "trainerProfile", onDelete: "cascade" });
        }
        if (models.LearnerProfile) {
            User.hasOne(models.LearnerProfile, { foreignKey: "userId", as: "learnerProfile", onDelete: "cascade" });
        }
    };

    return User;
}