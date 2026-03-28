const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentGatewayConfig = sequelize.define('PaymentGatewayConfig', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gateway: {
    type: DataTypes.ENUM('razorpay', 'payu'),
    allowNull: false,
    unique: true
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isSandbox: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'payment_gateway_configs',
  timestamps: true
});

module.exports = PaymentGatewayConfig;
