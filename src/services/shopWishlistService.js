const shopWishlistRepository = require('../repositories/shopWishlistRepository');
const ShopProduct = require('../models/shopProductModel');

class ShopWishlistService {
  async getWishlist(userId, page = 1, limit = 20) {
    const items = await shopWishlistRepository.findByUser(userId);
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);
    return { items: paginatedItems, total: items.length, page, limit };
  }

  async addToWishlist(userId, productId) {
    const product = await ShopProduct.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await shopWishlistRepository.addItem(userId, productId);
    return await this.getWishlist(userId);
  }

  async removeFromWishlist(userId, productId) {
    const result = await shopWishlistRepository.removeItem(userId, productId);
    if (!result) throw new Error('Item not in wishlist');
    return await this.getWishlist(userId);
  }

  async clearWishlist(userId) {
    await shopWishlistRepository.clearWishlist(userId);
    return { items: [], total: 0 };
  }

  async isInWishlist(userId, productId) {
    const item = await shopWishlistRepository.findItem(userId, productId);
    return !!item;
  }
}

module.exports = new ShopWishlistService();
