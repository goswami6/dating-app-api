const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TopPick = sequelize.define('TopPick', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'The user who sees this top pick'
    },
    pickedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'The user being recommended as a top pick'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'When this top pick expires (e.g. 24 hours)'
    }
}, {
    tableName: 'top_picks',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'pickedUserId']
        },
        {
            fields: ['expiresAt']
        }
    ]
});

module.exports = TopPick;
