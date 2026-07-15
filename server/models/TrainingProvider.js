module.exports = (sequelize, DataTypes) => {
    const TrainingProvider = sequelize.define("TrainingProvider", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        orgDetails: { type: DataTypes.TEXT, allowNull: true },
        companyRegistrationId: { type: DataTypes.STRING(50), allowNull: true },
        telephoneNo: { type: DataTypes.STRING(20), allowNull: true },
        emailAddress: { type: DataTypes.STRING(50), allowNull: true },
        accreditationStatus: { type: DataTypes.STRING(50), allowNull: true }
    }, { tableName: 'training_providers', timestamps: false });
    return TrainingProvider;
};