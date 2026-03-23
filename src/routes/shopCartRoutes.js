const express = require('express');
const router = express.Router();
const shopCartController = require('../controllers/shopCartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Shop Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /api/shop/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Shop Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved
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
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                         subtotal:
 *                           type: number
 *                         itemCount:
 *                           type: integer
 */
router.get('/', shopCartController.getCart);

/**
 * @swagger
 * /api/shop/cart/count:
 *   get:
 *     summary: Get cart item count
 *     tags: [Shop Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cart count retrieved
 */
router.get('/count', shopCartController.getCount);

/**
 * @swagger
 * /api/shop/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Shop Cart]
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
 *               - productId
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 1
 *                 default: 1
 *               selectedAttributes:
 *                 type: object
 *                 example: {"color": "Red", "size": "M"}
 *     responses:
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Product unavailable or out of stock
 */
router.post('/add', shopCartController.addToCart);

/**
 * @swagger
 * /api/shop/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Shop Cart]
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
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Error
 */
router.put('/update', shopCartController.updateItem);

/**
 * @swagger
 * /api/shop/cart/remove/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Shop Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/remove/:productId', shopCartController.removeItem);

/**
 * @swagger
 * /api/shop/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Shop Cart]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/clear', shopCartController.clearCart);

module.exports = router;
