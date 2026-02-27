const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'dating_app', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || '', 
    {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '+05:30',
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000,
        evict: 1000
    },
    retry: {
        max: 3
    },
    dialectOptions: {
        connectTimeout: 60000
    }
});

module.exports = sequelize;