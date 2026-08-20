module.exports = (sequelize, DataTypes) => {
    const LearnerProfile = sequelize.define("LearnerProfile", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        name: { 
            type: DataTypes.STRING(100), 
            allowNull: true 
        },
        email: { 
            type: DataTypes.STRING(255), 
            allowNull: true,
            validate: { isEmail: true }
        },
        mobileNo: { 
            type: DataTypes.STRING(8), 
            allowNull: true 
        },
        educationQualification: { 
            type: DataTypes.STRING(50), 
            allowNull: true 
        },
        areaOfInterest: { 
            type: DataTypes.STRING(100), 
            allowNull: true 
        },
        attachment: { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        }
    }, { tableName: 'learner_profiles', timestamps: false });

    return LearnerProfile;
};