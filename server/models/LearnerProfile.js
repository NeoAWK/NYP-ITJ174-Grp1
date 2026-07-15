module.exports = (sequelize, DataTypes) => {
    const LearnerProfile = sequelize.define("LearnerProfile", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        enrolledCourse: { type: DataTypes.STRING(100), allowNull: true },
        moduleHours: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
        notStarted: { type: DataTypes.BOOLEAN, defaultValue: true },
        inProgress: { type: DataTypes.BOOLEAN, defaultValue: false },
        completed: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { tableName: 'learner_profiles', timestamps: false });
    return LearnerProfile;
};