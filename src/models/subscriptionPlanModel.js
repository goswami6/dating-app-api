const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Plan name e.g. "Tinder Plus", "Tinder Gold", "Tinder Platinum"'
    },
    tagline: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Plan tagline / short description'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Duration in days (e.g. 7 for weekly)'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR'
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of feature strings e.g. ["unlimited_likes","see_who_likes_you"]'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'subscription_plans',
    timestamps: true
});

module.exports = SubscriptionPlan;
