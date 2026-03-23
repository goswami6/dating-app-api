const shopOrderService = require('../services/shopOrderService');
const apiResponse = require('../utils/apiResponse');

class ShopOrderController {
  async placeOrder(req, res) {
    try {
      const { addressId, paymentMethod, couponCode, notes } = req.body;
      const order = await shopOrderService.placeOrder(req.user.id, { addressId, paymentMethod, couponCode, notes });
      return apiResponse.success(res, 'Order placed successfully', { order }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async getOrders(req, res) {
    try {
      const { page, limit, status } = req.query;
      const result = await shopOrderService.getOrders(
        req.user.id,
        parseInt(page) || 1,
        parseInt(limit) || 10,
        status
      );
      return apiResponse.success(res, 'Orders retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const order = await shopOrderService.getOrderById(req.user.id, parseInt(req.params.id));
      return apiResponse.success(res, 'Order retrieved', { order });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getByOrderNumber(req, res) {
    try {
      const order = await shopOrderService.getOrderByNumber(req.user.id, req.params.orderNumber);
      return apiResponse.success(res, 'Order retrieved', { order });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async cancelOrder(req, res) {
    try {
      const { reason } = req.body;
      const order = await shopOrderService.cancelOrder(req.user.id, parseInt(req.params.id), reason);
      return apiResponse.success(res, 'Order cancelled', { order });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new ShopOrderController();
