const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopCategory = sequelize.define('ShopCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'shop_categories', key: 'id' },
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'shop_categories',
  timestamps: true,
});

module.exports = ShopCategory;
