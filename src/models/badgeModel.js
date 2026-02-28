const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define('Badge', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Icon name/identifier for the badge (e.g. "verified", "star", "diamond")'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    requiredMonth: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Months of membership required to earn this badge'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#FF4081',
        comment: 'Hex color code for badge display (e.g. "#FF4081")'
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this badge is only for premium users'
    }
}, {
    tableName: 'badges',
    timestamps: true
});

module.exports = Badge;
