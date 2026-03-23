const express = require('express');
const router = express.Router();
const shopWishlistController = require('../controllers/shopWishlistController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Shop Wishlist
 *   description: Product wishlist management
 */

/**
 * @swagger
 * /api/shop/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Shop Wishlist]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Wishlist retrieved
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
 *                         pagination:
 *                           type: object
 */
router.get('/', shopWishlistController.getWishlist);

/**
 * @swagger
 * /api/shop/wishlist/check/{productId}:
 *   get:
 *     summary: Check if product is in wishlist
 *     tags: [Shop Wishlist]
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
 *         description: Wishlist check result
 */
router.get('/check/:productId', shopWishlistController.checkItem);

/**
 * @swagger
 * /api/shop/wishlist/add:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Shop Wishlist]
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
 *     responses:
 *       201:
 *         description: Added to wishlist
 *       400:
 *         description: Already in wishlist or product not found
 */
router.post('/add', shopWishlistController.addToWishlist);

/**
 * @swagger
 * /api/shop/wishlist/remove/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Shop Wishlist]
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
 *         description: Removed from wishlist
 */
router.delete('/remove/:productId', shopWishlistController.removeFromWishlist);

/**
 * @swagger
 * /api/shop/wishlist/clear:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Shop Wishlist]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
 */
router.delete('/clear', shopWishlistController.clearWishlist);

module.exports = router;
