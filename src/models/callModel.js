const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  callerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  callType: {
    type: DataTypes.ENUM('voice', 'video'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ringing', 'ongoing', 'ended', 'missed', 'rejected', 'busy'),
    allowNull: false,
    defaultValue: 'ringing',
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Duration in seconds',
  },
  endReason: {
    type: DataTypes.ENUM('completed', 'caller_cancelled', 'receiver_rejected', 'receiver_busy', 'no_answer', 'network_error'),
    allowNull: true,
  },
}, {
  tableName: 'calls',
  timestamps: true,
});

module.exports = Call;
