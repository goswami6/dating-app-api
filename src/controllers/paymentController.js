const paymentService = require('../services/paymentService');
const apiResponse = require('../utils/apiResponse');

class PaymentController {
  async getAvailableGateways(req, res) {
    try {
      const gateways = await paymentService.getPublicGatewayStatus();
      return apiResponse.success(res, 'Available payment gateways', gateways);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { gateway, amount, purpose, metadata } = req.body;

      if (!gateway || amount === undefined || amount === null) {
        return apiResponse.error(res, 'gateway and amount are required', 400);
      }

      const data = await paymentService.createPaymentOrder({
        userId,
        gateway,
        amount,
        purpose: purpose || 'wallet_recharge',
        metadata: metadata || {}
      });

      return apiResponse.success(res, 'Payment order created', data, 201);
    } catch (err) {
      return apiResponse.error(res, err.message, 400);
    }
  }

  async verifyRazorpay(req, res) {
    try {
      const userId = req.user.id;
      const paymentOrderId = parseInt(req.params.id);
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const data = await paymentService.verifyRazorpayOrder({
        paymentOrderId,
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });

      return apiResponse.success(res, 'Razorpay payment verified', data);
    } catch (err) {
      return apiResponse.error(res, err.message, 400);
    }
  }

  async verifyPayU(req, res) {
    try {
      const userId = req.user.id;
      const paymentOrderId = parseInt(req.params.id);
      const { status, txnid, mihpayid, hash, paymentMode, errorMessage } = req.body;

      const data = await paymentService.verifyPayUOrder({
        paymentOrderId,
        userId,
        status,
        txnid,
        mihpayid,
        hash,
        paymentMode,
        errorMessage
      });

      return apiResponse.success(res, 'PayU payment verified', data);
    } catch (err) {
      return apiResponse.error(res, err.message, 400);
    }
  }

  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, gateway, status } = req.query;

      const data = await paymentService.getMyPaymentOrders(userId, {
        page,
        limit,
        gateway,
        status
      });

      return apiResponse.success(res, 'My payment orders', data);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }
}

module.exports = new PaymentController();
