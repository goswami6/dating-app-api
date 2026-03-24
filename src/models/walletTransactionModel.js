const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  walletId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('recharge', 'chat', 'voice_call', 'video_call', 'gift', 'refund'),
    allowNull: false,
    defaultValue: 'recharge'
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'UPI, Card, NetBanking etc. (only for recharge)'
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'External payment reference or internal ref (callId, matchId etc.)'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Wallet balance after this transaction'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Extra data: targetUserId, callDuration, etc.'
  }
}, {
  tableName: 'wallet_transactions',
  timestamps: true
});

module.exports = WalletTransaction;
