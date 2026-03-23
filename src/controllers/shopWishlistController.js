const shopWishlistService = require('../services/shopWishlistService');
const apiResponse = require('../utils/apiResponse');

class ShopWishlistController {
  async getWishlist(req, res) {
    try {
      const { page, limit } = req.query;
      const wishlist = await shopWishlistService.getWishlist(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      return apiResponse.success(res, 'Wishlist retrieved', wishlist);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async addToWishlist(req, res) {
    try {
      const item = await shopWishlistService.addToWishlist(req.user.id, req.body.productId);
      return apiResponse.success(res, 'Added to wishlist', { item }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async removeFromWishlist(req, res) {
    try {
      const result = await shopWishlistService.removeFromWishlist(req.user.id, parseInt(req.params.productId));
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async clearWishlist(req, res) {
    try {
      const result = await shopWishlistService.clearWishlist(req.user.id);
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async checkItem(req, res) {
    try {
      const inWishlist = await shopWishlistService.isInWishlist(req.user.id, parseInt(req.params.productId));
      return apiResponse.success(res, 'Wishlist check', { inWishlist });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }
}

module.exports = new ShopWishlistController();
