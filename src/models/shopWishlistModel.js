const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopWishlist = sequelize.define('ShopWishlist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'shop_wishlist',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'productId'] },
  ],
});

module.exports = ShopWishlist;
