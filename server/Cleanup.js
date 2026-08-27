const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'rightskills.sqlite'),
    logging: console.log
});

async function run() {
    const [results, metadata] = await sequelize.query(
        "DELETE FROM users WHERE id IN (2004, 2005)"
    );
    console.log("Deleted rows:", metadata.rowsAffected ?? metadata);
    await sequelize.close();
}

run().catch(console.error);