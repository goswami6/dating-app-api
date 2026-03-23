const shopCartRepository = require('../repositories/shopCartRepository');
const ShopProduct = require('../models/shopProductModel');

class ShopCartService {
  async getCart(userId) {
    const items = await shopCartRepository.findByUser(userId);
    let subtotal = 0;
    const cartItems = items.map(item => {
      const itemTotal = parseFloat(item.Product.price) * item.quantity;
      subtotal += itemTotal;
      return {
        id: item.id,
        productId: item.productId,
        product: item.Product,
        quantity: item.quantity,
        selectedAttributes: item.selectedAttributes,
        itemTotal,
      };
    });
    return { items: cartItems, subtotal: Math.round(subtotal * 100) / 100, totalItems: items.length };
  }

  async addToCart(userId, productId, quantity = 1, selectedAttributes = {}) {
    const product = await ShopProduct.findByPk(productId);
    if (!product) throw new Error('Product not found');
    if (!product.isActive) throw new Error('Product is not available');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    await shopCartRepository.addItem(userId, productId, quantity, selectedAttributes);
    return await this.getCart(userId);
  }

  async updateCartItem(userId, productId, quantity) {
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    const product = await ShopProduct.findByPk(productId);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient stock');

    const item = await shopCartRepository.updateQuantity(userId, productId, quantity);
    if (!item) throw new Error('Item not in cart');
    return await this.getCart(userId);
  }

  async removeFromCart(userId, productId) {
    const result = await shopCartRepository.removeItem(userId, productId);
    if (!result) throw new Error('Item not in cart');
    return await this.getCart(userId);
  }

  async clearCart(userId) {
    await shopCartRepository.clearCart(userId);
    return { items: [], subtotal: 0, totalItems: 0 };
  }

  async getCartCount(userId) {
    return await shopCartRepository.getCartCount(userId);
  }
}

module.exports = new ShopCartService();
