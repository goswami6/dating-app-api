const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    matchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'matches',
            key: 'id'
        }
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'messages',
    timestamps: true,
    indexes: [
        {
            fields: ['matchId', 'sentAt']
        }
    ]
});

module.exports = Message;
