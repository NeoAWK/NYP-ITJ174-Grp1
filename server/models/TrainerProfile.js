module.exports = (sequelize, DataTypes) => {
  const TrainerProfile = sequelize.define(
    "TrainerProfile",
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',        // foreign key to users.id
          key: 'id'
        }
      },
      areasOfExpertise: { type: DataTypes.STRING(100), allowNull: true },
      resumeExperience: { type: DataTypes.TEXT, allowNull: true },
      qualifications: { type: DataTypes.TEXT, allowNull: true },
      certification: { type: DataTypes.TEXT, allowNull: true },
      experience: { type: DataTypes.TEXT, allowNull: true },
      experienceEntries: { type: DataTypes.TEXT, allowNull: true },
      professionalDevelopment: { type: DataTypes.TEXT, allowNull: true },
      certificationValidity: { type: DataTypes.DATEONLY, allowNull: true },
      certificateFile: { type: DataTypes.STRING(255), allowNull: true },
      certificateFiles: { type: DataTypes.TEXT, allowNull: true },
      providerId: {type: DataTypes.INTEGER,allowNull: true,  references: {model: 'users', key: 'id'}}
    },
    {
      tableName: 'trainer_profiles',
      timestamps: false     
    }
  );

  TrainerProfile.associate = function(models) {
    TrainerProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'           
    });

    TrainerProfile.belongsTo(models.User, {
      foreignKey: 'providerId',
      as: 'provider'        
    });
  };

  return TrainerProfile;};