module.exports = (sequelize, DataTypes) => {
    const TrainerProfile = sequelize.define("TrainerProfile", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        // -- Registration fields (RegisterTrainer.jsx) --
        name: { type: DataTypes.STRING(100), allowNull: true },
        emailAddress: { type: DataTypes.STRING(100), allowNull: true },
        mobileNo: { type: DataTypes.STRING(20), allowNull: true },
        areasOfExpertise: { type: DataTypes.STRING(100), allowNull: true },
        resumeExperience: { type: DataTypes.TEXT, allowNull: true },
        // -- Dashboard / tracking fields (teammate) --
        qualifications: { type: DataTypes.TEXT, allowNull: true },
        certification: { type: DataTypes.TEXT, allowNull: true },
        experience: { type: DataTypes.TEXT, allowNull: true },
        experienceEntries: { type: DataTypes.TEXT, allowNull: true },
        professionalDevelopment: { type: DataTypes.TEXT, allowNull: true },
        certificationValidity: { type: DataTypes.DATEONLY, allowNull: true },
        certificateFile: { type: DataTypes.STRING(255), allowNull: true },
        certificateFiles: { type: DataTypes.TEXT, allowNull: true }
    }, { tableName: 'trainer_profiles', timestamps: false });

    return TrainerProfile;
};
