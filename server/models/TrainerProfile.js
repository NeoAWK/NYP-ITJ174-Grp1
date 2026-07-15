module.exports = (sequelize, DataTypes) => {
    const TrainerProfile = sequelize.define("TrainerProfile", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        qualifications: { type: DataTypes.TEXT, allowNull: true },
        certification: { type: DataTypes.TEXT, allowNull: true },
        experience: { type: DataTypes.TEXT, allowNull: true },
        professionalDevelopment: { type: DataTypes.TEXT, allowNull: true },
        certificationValidity: { type: DataTypes.DATEONLY, allowNull: true }
    }, { tableName: 'trainer_profiles', timestamps: false });
    return TrainerProfile;
};