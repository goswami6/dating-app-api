const ShopWishlist = require('../models/shopWishlistModel');
const ShopProduct = require('../models/shopProductModel');

class ShopWishlistRepository {
  async findByUser(userId) {
    return await ShopWishlist.findAll({
      where: { userId },
      include: [{ model: ShopProduct, as: 'Product' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findItem(userId, productId) {
    return await ShopWishlist.findOne({ where: { userId, productId } });
  }

  async addItem(userId, productId) {
    const existing = await this.findItem(userId, productId);
    if (existing) return existing;
    return await ShopWishlist.create({ userId, productId });
  }

  async removeItem(userId, productId) {
    const item = await this.findItem(userId, productId);
    if (!item) return null;
    await item.destroy();
    return true;
  }

  async clearWishlist(userId) {
    return await ShopWishlist.destroy({ where: { userId } });
  }

  async getCount(userId) {
    return await ShopWishlist.count({ where: { userId } });
  }
}

module.exports = new ShopWishlistRepository();
