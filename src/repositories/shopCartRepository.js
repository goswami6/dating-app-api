const ShopCart = require('../models/shopCartModel');
const ShopProduct = require('../models/shopProductModel');

class ShopCartRepository {
  async findByUser(userId) {
    return await ShopCart.findAll({
      where: { userId },
      include: [{ model: ShopProduct, as: 'Product' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async findItem(userId, productId) {
    return await ShopCart.findOne({ where: { userId, productId } });
  }

  async addItem(userId, productId, quantity, selectedAttributes) {
    const existing = await this.findItem(userId, productId);
    if (existing) {
      return await existing.update({ quantity: existing.quantity + quantity, selectedAttributes });
    }
    return await ShopCart.create({ userId, productId, quantity, selectedAttributes });
  }

  async updateQuantity(userId, productId, quantity) {
    const item = await this.findItem(userId, productId);
    if (!item) return null;
    return await item.update({ quantity });
  }

  async removeItem(userId, productId) {
    const item = await this.findItem(userId, productId);
    if (!item) return null;
    await item.destroy();
    return true;
  }

  async clearCart(userId) {
    return await ShopCart.destroy({ where: { userId } });
  }

  async getCartCount(userId) {
    return await ShopCart.sum('quantity', { where: { userId } }) || 0;
  }
}

module.exports = new ShopCartRepository();
