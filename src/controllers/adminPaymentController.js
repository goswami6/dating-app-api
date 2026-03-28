const paymentService = require('../services/paymentService');
const apiResponse = require('../utils/apiResponse');

class AdminPaymentController {
  async getGatewayConfigs(req, res) {
    try {
      const data = await paymentService.listGatewayConfigsForAdmin();
      return apiResponse.success(res, 'Payment gateway configs', data);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async updateGatewayConfig(req, res) {
    try {
      const gateway = req.params.gateway;
      const data = await paymentService.updateGatewayConfig(gateway, req.body || {}, req.user.id);
      return apiResponse.success(res, 'Gateway config updated', data);
    } catch (err) {
      return apiResponse.error(res, err.message, 400);
    }
  }

  async getPaymentOrders(req, res) {
    try {
      const { page, limit, gateway, status, purpose, search } = req.query;
      const data = await paymentService.getAdminPaymentOrders({ page, limit, gateway, status, purpose, search });
      return apiResponse.success(res, 'Payment orders', data);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async updatePaymentOrderStatus(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const { status, failureReason } = req.body;
      if (!status) return apiResponse.error(res, 'status is required', 400);

      const data = await paymentService.adminUpdatePaymentOrderStatus(orderId, status, failureReason || null);
      return apiResponse.success(res, 'Payment order updated', data);
    } catch (err) {
      return apiResponse.error(res, err.message, 400);
    }
  }
}

module.exports = new AdminPaymentController();
