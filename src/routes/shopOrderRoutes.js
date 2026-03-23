const express = require('express');
const router = express.Router();
const shopOrderController = require('../controllers/shopOrderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Shop Orders
 *   description: Order placement and management
 */

/**
 * @swagger
 * /api/shop/orders/place:
 *   post:
 *     summary: Place an order from cart
 *     description: Creates an order from all items currently in the user's cart. Cart is cleared after successful order placement. Shipping is free for orders ≥ ₹499. 18% GST is applied.
 *     tags: [Shop Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressId
 *               - paymentMethod
 *             properties:
 *               addressId:
 *                 type: integer
 *                 example: 1
 *                 description: Shipping address ID
 *               paymentMethod:
 *                 type: string
 *                 enum: [cod, upi, card, wallet, net_banking]
 *                 example: upi
 *               couponCode:
 *                 type: string
 *                 example: LOVE20
 *               notes:
 *                 type: string
 *                 example: Please gift wrap this
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         order:
 *                           $ref: '#/components/schemas/ShopOrder'
 *       400:
 *         description: Cart empty, address not found, or insufficient stock
 */
router.post('/place', shopOrderController.placeOrder);

/**
 * @swagger
 * /api/shop/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Shop Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned, refunded]
 *     responses:
 *       200:
 *         description: Orders retrieved
 */
router.get('/', shopOrderController.getOrders);

/**
 * @swagger
 * /api/shop/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     tags: [Shop Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number (e.g. ORD-1719312000000-A3B5)
 *     responses:
 *       200:
 *         description: Order retrieved
 *       404:
 *         description: Order not found
 */
router.get('/number/:orderNumber', shopOrderController.getByOrderNumber);

/**
 * @swagger
 * /api/shop/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Shop Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order retrieved
 *       404:
 *         description: Order not found
 */
router.get('/:id', shopOrderController.getById);

/**
 * @swagger
 * /api/shop/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     description: Cancel a pending or confirmed order. Stock is restored automatically.
 *     tags: [Shop Orders]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Changed my mind
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Order cannot be cancelled
 */
router.put('/:id/cancel', shopOrderController.cancelOrder);

module.exports = router;
