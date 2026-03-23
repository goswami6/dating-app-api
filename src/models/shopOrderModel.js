const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopOrder = sequelize.define('ShopOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addressId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('cod', 'upi', 'card', 'wallet', 'net_banking'),
    allowNull: false,
    defaultValue: 'cod',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  shippingCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR',
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  cancelReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'shop_orders',
  timestamps: true,
});

const ShopOrderItem = sequelize.define('ShopOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productImage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  selectedAttributes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'shop_order_items',
  timestamps: true,
});

module.exports = { ShopOrder, ShopOrderItem };
