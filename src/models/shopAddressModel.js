const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopAddress = sequelize.define('ShopAddress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Home, Office, etc.',
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  addressLine2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'India',
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'shop_addresses',
  timestamps: true,
});

module.exports = ShopAddress;
