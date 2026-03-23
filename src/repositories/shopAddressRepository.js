const ShopAddress = require('../models/shopAddressModel');

class ShopAddressRepository {
  async findByUser(userId) {
    return await ShopAddress.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findById(id, userId) {
    return await ShopAddress.findOne({ where: { id, userId } });
  }

  async create(data) {
    if (data.isDefault) {
      await ShopAddress.update({ isDefault: false }, { where: { userId: data.userId } });
    }
    return await ShopAddress.create(data);
  }

  async update(id, userId, data) {
    const addr = await this.findById(id, userId);
    if (!addr) return null;
    if (data.isDefault) {
      await ShopAddress.update({ isDefault: false }, { where: { userId } });
    }
    return await addr.update(data);
  }

  async delete(id, userId) {
    const addr = await this.findById(id, userId);
    if (!addr) return null;
    await addr.destroy();
    return true;
  }

  async getDefault(userId) {
    return await ShopAddress.findOne({ where: { userId, isDefault: true } });
  }
}

module.exports = new ShopAddressRepository();
