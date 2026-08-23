require('dotenv').config();
const db = require('../models');
const { cleanupNonPersistentUsers, ensurePersistentTestUsers } = require('../utils/persistentUsers');

async function run() {
    try {
        await db.sequelize.authenticate();
        await ensurePersistentTestUsers(db.User, db.TrainerProfile);
        const cleanupResult = await cleanupNonPersistentUsers(db.User);

        console.log(`Removed ${cleanupResult.deletedCount} non-persistent account(s).`);
        console.log('Remaining users:');
        cleanupResult.remainingUsers.forEach((user) => {
            console.log(`- ${user.id} | ${user.email} | ${user.usertype}`);
        });
    } catch (err) {
        console.error('Cleanup failed:', err.message);
        process.exitCode = 1;
    } finally {
        await db.sequelize.close();
    }
}

run();
