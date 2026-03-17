const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MatchCriteria = sequelize.define('MatchCriteria', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    minAge: {
        type: DataTypes.INTEGER,
        defaultValue: 18,
        validate: { min: 18, max: 120 }
    },
    maxAge: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
        validate: { min: 18, max: 120 }
    },
    maxDistance: {
        type: DataTypes.DOUBLE,
        defaultValue: 50.0,
        comment: 'Maximum distance in km'
    },
    interests: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Preferred interests to filter by e.g. ["travel","music"]'
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'all'),
        defaultValue: 'all',
        comment: 'Preferred gender for matches'
    },
    onlineOnly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Only show online users'
    },
    incognitoMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Hide profile from discovery'
    },
    relationshipGoals: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of relationship goals with title/icon'
    },
    pronouns: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of pronouns'
    },
    height: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Height as text (e.g. 5\'8\")'
    },
    languages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of languages'
    },
    zodiacSign: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Zodiac sign'
    },
    educationLevel: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Education level'
    },
    familyPlan: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Family plan option'
    },
    communicationStyle: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Communication style'
    },
    loveStyle: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Love style'
    },
    petPreference: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Pet preference'
    },
    drinking: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Drinking option'
    },
    smoking: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Smoking option'
    },
    workout: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Workout frequency'
    },
    socialMedia: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Social media usage'
    },
    school: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'School name (text)'
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Job title (text)'
    },
    livingIn: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Living in (location)'
    },
    sexualOrientation: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of sexual orientation objects (title/description)'
    }
}, {
    tableName: 'match_criteria',
    timestamps: true
});

module.exports = MatchCriteria;
