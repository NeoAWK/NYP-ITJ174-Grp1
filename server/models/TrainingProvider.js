module.exports = (sequelize, DataTypes) => {
    const TrainingProvider = sequelize.define("TrainingProvider", {
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
        name: { 
            type: DataTypes.STRING(100), 
            allowNull: true,
            field: 'Name' // Maps JavaScript 'name' property to SQL column 'Name'
        },
        emailAddress: { type: DataTypes.STRING(100), allowNull: true },
        mobileNo: { type: DataTypes.STRING(20), allowNull: true },
        companyRegistrationId: { type: DataTypes.STRING(50), allowNull: true },
        companyAddress: { type: DataTypes.STRING(120), allowNull: true },
        postalCode: { type: DataTypes.STRING(20), allowNull: true },
        companyWebsite: { type: DataTypes.STRING(255), allowNull: true },
        mainFieldOfTraining: { type: DataTypes.STRING(100), allowNull: true },
        proofOfCertification: { type: DataTypes.TEXT, allowNull: true }
    }, { tableName: 'training_providers', timestamps: false });

    return TrainingProvider;
};