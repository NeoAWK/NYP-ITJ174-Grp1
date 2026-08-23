const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const PERSISTENT_TEST_USERS = Object.freeze([
    { id: 2000, email: 'admin123@abc.com' },
    { id: 2001, email: 'test.trainer@rightskills.local' }
]);

const PERSISTENT_TEST_USER_IDS = Object.freeze(PERSISTENT_TEST_USERS.map((user) => user.id));
const PERSISTENT_TEST_USER_EMAILS = Object.freeze(PERSISTENT_TEST_USERS.map((user) => user.email));

async function cleanupNonPersistentUsers(UserModel) {
    const persistentUsers = await UserModel.findAll({
        where: {
            [Op.or]: [
                { id: { [Op.in]: PERSISTENT_TEST_USER_IDS } },
                { email: { [Op.in]: PERSISTENT_TEST_USER_EMAILS } }
            ]
        },
        attributes: ['id', 'email']
    });

    const keepIds = persistentUsers.map((user) => user.id);
    const keepEmails = persistentUsers.map((user) => user.email);

    const deletedCount = await UserModel.destroy({
        where: {
            [Op.and]: [
                { id: { [Op.notIn]: keepIds.length ? keepIds : PERSISTENT_TEST_USER_IDS } },
                { email: { [Op.notIn]: keepEmails.length ? keepEmails : PERSISTENT_TEST_USER_EMAILS } }
            ]
        }
    });

    const remainingUsers = await UserModel.findAll({
        attributes: ['id', 'name', 'email', 'usertype', 'isVerified'],
        order: [['id', 'ASC']]
    });

    return {
        deletedCount,
        remainingUsers,
        persistentUserIds: keepIds.length ? keepIds : PERSISTENT_TEST_USER_IDS,
        persistentUserEmails: keepEmails.length ? keepEmails : PERSISTENT_TEST_USER_EMAILS
    };
}

async function ensurePersistentTestUsers(UserModel, TrainerProfileModel) {
    const adminPasswordHash = await bcrypt.hash('P@ssw0rd', 10);
    const [admin] = await UserModel.findOrCreate({
        where: { email: 'admin123@abc.com' },
        defaults: {
            id: 2000,
            name: 'Admin Account',
            email: 'admin123@abc.com',
            password: adminPasswordHash,
            isVerified: true,
            usertype: 'RightSkills'
        }
    });

    await admin.update({
        name: 'Admin Account',
        password: adminPasswordHash,
        isVerified: true,
        usertype: 'RightSkills'
    });

    const trainerPasswordHash = await bcrypt.hash('P@ssw0rd', 10);
    const [trainer] = await UserModel.findOrCreate({
        where: { email: 'test.trainer@rightskills.local' },
        defaults: {
            id: 2001,
            name: 'Test Trainer',
            email: 'test.trainer@rightskills.local',
            password: trainerPasswordHash,
            isVerified: true,
            usertype: 'Trainer'
        }
    });

    await trainer.update({
        name: 'Test Trainer',
        password: trainerPasswordHash,
        isVerified: true,
        usertype: 'Trainer'
    });

    if (TrainerProfileModel) {
        await TrainerProfileModel.findOrCreate({
            where: { userId: trainer.id },
            defaults: {
                userId: trainer.id,
                qualifications: 'Diploma in Applied Learning and Development',
                certification: 'Certified Workplace Trainer',
                experience: 'Three years delivering technical and workplace skills training.',
                professionalDevelopment: 'Annual trainer development programme',
                certificationValidity: '2028-12-31'
            }
        });
    }
}

module.exports = {
    PERSISTENT_TEST_USERS,
    PERSISTENT_TEST_USER_IDS,
    PERSISTENT_TEST_USER_EMAILS,
    cleanupNonPersistentUsers,
    ensurePersistentTestUsers
};
