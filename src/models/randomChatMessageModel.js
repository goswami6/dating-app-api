const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RandomChatMessage = sequelize.define('RandomChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'random_chats', key: 'id' }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'gif', 'voice'),
    defaultValue: 'text'
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'random_chat_messages',
  timestamps: true
});

module.exports = RandomChatMessage;
