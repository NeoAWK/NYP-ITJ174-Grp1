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
        // -- Registration fields (RegisterProvider.jsx) --
        companyRegistrationId: { type: DataTypes.STRING(50), allowNull: true }, // shared with teammate's field of the same name
        companyAddress: { type: DataTypes.STRING(120), allowNull: true },
        postalCode: { type: DataTypes.STRING(20), allowNull: true },
        companyWebsite: { type: DataTypes.STRING(255), allowNull: true },
        mainFieldOfTraining: { type: DataTypes.STRING(100), allowNull: true },
        proofOfCertification: { type: DataTypes.TEXT, allowNull: true },
        // -- Dashboard / tracking fields (teammate) --
        orgDetails: { type: DataTypes.TEXT, allowNull: true },
        telephoneNo: { type: DataTypes.STRING(20), allowNull: true }, // NOTE: overlaps in meaning with mobileNo above — confirm with teammate whether to consolidate
        emailAddress: { type: DataTypes.STRING(50), allowNull: true },
        accreditationStatus: { type: DataTypes.STRING(50), allowNull: true }
    }, { tableName: 'training_providers', timestamps: false });

    return TrainingProvider;
};