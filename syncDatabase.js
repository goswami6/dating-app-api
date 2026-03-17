const mysql = require('mysql2/promise');
const { DataTypes } = require('sequelize');
require('dotenv').config();

const { sequelize, MatchCriteria, Message, Subscription } = require('./src/models');

async function ensureMatchCriteriaColumns() {
    const queryInterface = sequelize.getQueryInterface();
    let tableDefinition;

    try {
        tableDefinition = await queryInterface.describeTable('match_criteria');
    } catch (error) {
        return;
    }

    const missingColumns = [
        {
            name: 'relationshipGoals',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of relationship goals with title/icon'
            }
        },
        {
            name: 'pronouns',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of pronouns'
            }
        },
        {
            name: 'height',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Height as text (e.g. 5\'8")'
            }
        },
        {
            name: 'languages',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of languages'
            }
        },
        {
            name: 'zodiacSign',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Zodiac sign'
            }
        },
        {
            name: 'educationLevel',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Education level'
            }
        },
        {
            name: 'familyPlan',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Family plan option'
            }
        },
        {
            name: 'communicationStyle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Communication style'
            }
        },
        {
            name: 'loveStyle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Love style'
            }
        },
        {
            name: 'petPreference',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Pet preference'
            }
        },
        {
            name: 'drinking',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Drinking option'
            }
        },
        {
            name: 'smoking',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Smoking option'
            }
        },
        {
            name: 'workout',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Workout frequency'
            }
        },
        {
            name: 'socialMedia',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Social media usage'
            }
        },
        {
            name: 'school',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'School name (text)'
            }
        },
        {
            name: 'jobTitle',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Job title (text)'
            }
        },
        {
            name: 'livingIn',
            definition: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Living in (location)'
            }
        },
        {
            name: 'sexualOrientation',
            definition: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                comment: 'Array of sexual orientation objects (title/description)'
            }
        }
    ];

    for (const column of missingColumns) {
        if (!tableDefinition[column.name]) {
            await queryInterface.addColumn('match_criteria', column.name, column.definition);
            console.log(`Added missing column match_criteria.${column.name}`);
        }
    }
}

async function syncDatabaseSchema() {
    await MatchCriteria.sync({ alter: true });
    await ensureMatchCriteriaColumns();
    await Message.sync({ alter: true });
    await Subscription.sync({ alter: true });
}

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log(`Database '${process.env.DB_NAME}' checked/created.`);
        await connection.end();

        await syncDatabaseSchema();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    initializeDatabase,
    syncDatabaseSchema,
};

if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
