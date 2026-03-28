const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentOrder = sequelize.define('PaymentOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gateway: {
    type: DataTypes.ENUM('razorpay', 'payu'),
    allowNull: false
  },
  purpose: {
    type: DataTypes.ENUM('wallet_recharge', 'subscription', 'other'),
    allowNull: false,
    defaultValue: 'wallet_recharge'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('created', 'pending', 'success', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'created'
  },
  providerOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  providerPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  providerSignature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  providerTxnId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  walletTransactionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payment_orders',
  timestamps: true
});

module.exports = PaymentOrder;
