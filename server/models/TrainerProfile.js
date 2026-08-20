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
        name: { type: DataTypes.STRING(100), allowNull: true },
        emailAddress: { type: DataTypes.STRING(100), allowNull: true },
        mobileNo: { type: DataTypes.STRING(20), allowNull: true },
        areasOfExpertise: { type: DataTypes.STRING(100), allowNull: true },
        resumeExperience: { type: DataTypes.TEXT, allowNull: true }
    }, { tableName: 'trainer_profiles', timestamps: false });

    return TrainerProfile;
};