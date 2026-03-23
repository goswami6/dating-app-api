const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopProduct = sequelize.define('ShopProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  compareAtPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Original price before discount',
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR',
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of image URLs',
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'size, color, material etc.',
  },
  avgRating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    defaultValue: 0,
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Emoji or icon representing the product',
  },
}, {
  tableName: 'shop_products',
  timestamps: true,
});

module.exports = ShopProduct;
