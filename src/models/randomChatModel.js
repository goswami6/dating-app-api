const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RandomChat = sequelize.define('RandomChat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('active', 'ended', 'blocked'),
    defaultValue: 'active'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalMessages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: 'Total wallet amount spent in this chat'
  }
}, {
  tableName: 'random_chats',
  timestamps: true
});

module.exports = RandomChat;
