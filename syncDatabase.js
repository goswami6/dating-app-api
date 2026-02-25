const mysql = require('mysql2/promise');
require('dotenv').config();

const { sequelize } = require('./src/models');


async function initializeDatabase() {
    try {
        // 1. Create Database if it doesn't exist
        // Connect to MySQL server without selecting a database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`✅ Database '${process.env.DB_NAME}' checked/created.`);
        await connection.end();

        try {
            await sequelize.sync({ alter: true });
        } catch (error) {
            console.warn("⚠️ Global sync warning: " + error.message + ". Trying sync without alter.");
            await sequelize.sync();
        }
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }

module.exports = initializeDatabase;

// Run directly if called from command line
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
