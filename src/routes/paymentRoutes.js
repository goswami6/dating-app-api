const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Online payment orders and verification (Razorpay, PayU)
 */

/**
 * @swagger
 * /api/payments/gateways:
 *   get:
 *     summary: Get available payment gateways enabled by admin
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available gateways
 */
router.get('/gateways', paymentController.getAvailableGateways);

/**
 * @swagger
 * /api/payments/orders:
 *   post:
 *     summary: Create online payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gateway, amount]
 *             properties:
 *               gateway:
 *                 type: string
 *                 enum: [razorpay, payu]
 *               amount:
 *                 type: number
 *               purpose:
 *                 type: string
 *                 enum: [wallet_recharge, subscription, other]
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Payment order created
 */
router.post('/orders', paymentController.createOrder);

/**
 * @swagger
 * /api/payments/orders/{id}/verify/razorpay:
 *   post:
 *     summary: Verify Razorpay payment signature and complete payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpayOrderId, razorpayPaymentId, razorpaySignature]
 *             properties:
 *               razorpayOrderId: { type: string }
 *               razorpayPaymentId: { type: string }
 *               razorpaySignature: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified and wallet updated
 */
router.post('/orders/:id/verify/razorpay', paymentController.verifyRazorpay);

/**
 * @swagger
 * /api/payments/orders/{id}/verify/payu:
 *   post:
 *     summary: Verify PayU payment hash and complete payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, txnid, hash]
 *             properties:
 *               status: { type: string }
 *               txnid: { type: string }
 *               mihpayid: { type: string }
 *               hash: { type: string }
 *               paymentMode: { type: string }
 *               errorMessage: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified and wallet updated
 */
router.post('/orders/:id/verify/payu', paymentController.verifyPayU);

/**
 * @swagger
 * /api/payments/orders/my:
 *   get:
 *     summary: Get my payment orders
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: gateway
 *         schema:
 *           type: string
 *           enum: [razorpay, payu]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: My payment orders list
 */
router.get('/orders/my', paymentController.getMyOrders);

module.exports = router;
