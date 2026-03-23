const { Op } = require('sequelize');
const { ShopOrder, ShopOrderItem } = require('../models/shopOrderModel');
const ShopProduct = require('../models/shopProductModel');
const ShopAddress = require('../models/shopAddressModel');
const User = require('../models/userModel');

class ShopOrderRepository {
  async create(orderData, items) {
    const order = await ShopOrder.create(orderData);
    const orderItems = items.map(item => ({ ...item, orderId: order.id }));
    await ShopOrderItem.bulkCreate(orderItems);
    return await this.findById(order.id);
  }

  async findById(id) {
    return await ShopOrder.findByPk(id, {
      include: [
        { model: ShopOrderItem, as: 'Items', include: [{ model: ShopProduct, as: 'Product', attributes: ['id', 'name', 'thumbnail', 'slug'] }] },
        { model: ShopAddress, as: 'Address' },
      ],
    });
  }

  async findByUser(userId, { page = 1, limit = 10, status } = {}) {
    const where = { userId };
    if (status) where.status = status;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await ShopOrder.findAndCountAll({
      where,
      include: [
        { model: ShopOrderItem, as: 'Items' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
  }

  async findByOrderNumber(orderNumber) {
    return await ShopOrder.findOne({
      where: { orderNumber },
      include: [
        { model: ShopOrderItem, as: 'Items', include: [{ model: ShopProduct, as: 'Product', attributes: ['id', 'name', 'thumbnail', 'slug'] }] },
        { model: ShopAddress, as: 'Address' },
      ],
    });
  }

  async updateStatus(id, data) {
    const order = await ShopOrder.findByPk(id);
    if (!order) return null;
    return await order.update(data);
  }
}

module.exports = new ShopOrderRepository();
