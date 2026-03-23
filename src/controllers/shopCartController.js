const shopCartService = require('../services/shopCartService');
const apiResponse = require('../utils/apiResponse');

class ShopCartController {
  async getCart(req, res) {
    try {
      const cart = await shopCartService.getCart(req.user.id);
      return apiResponse.success(res, 'Cart retrieved', cart);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async addToCart(req, res) {
    try {
      const { productId, quantity, selectedAttributes } = req.body;
      const item = await shopCartService.addToCart(req.user.id, productId, quantity, selectedAttributes);
      return apiResponse.success(res, 'Item added to cart', { item }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async updateItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const item = await shopCartService.updateCartItem(req.user.id, productId, quantity);
      return apiResponse.success(res, 'Cart item updated', { item });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async removeItem(req, res) {
    try {
      const result = await shopCartService.removeFromCart(req.user.id, parseInt(req.params.productId));
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async clearCart(req, res) {
    try {
      const result = await shopCartService.clearCart(req.user.id);
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getCount(req, res) {
    try {
      const count = await shopCartService.getCartCount(req.user.id);
      return apiResponse.success(res, 'Cart count retrieved', { count });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }
}

module.exports = new ShopCartController();
