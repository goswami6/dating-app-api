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
        allowNull: true
    },
    messageType: {
        type: DataTypes.ENUM('text', 'image', 'gif', 'voice', 'video'),
        defaultValue: 'text'
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL for image/gif/voice/video'
    },
    replyToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'messages',
            key: 'id'
        },
        comment: 'ID of message being replied to'
    },
    reaction: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Emoji reaction e.g. ❤️ 😂 👍'
    },
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isStarred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isDelivered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isReported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reportReason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sentAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'messages',
    timestamps: true,
    indexes: [
        { fields: ['matchId', 'sentAt'] },
        { fields: ['senderId'] },
        { fields: ['isRead'] },
        { fields: ['isPinned'] },
        { fields: ['isStarred'] }
    ]
});

module.exports = Message;
