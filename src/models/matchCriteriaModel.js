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
    }
}, {
    tableName: 'match_criteria',
    timestamps: true
});

module.exports = MatchCriteria;
