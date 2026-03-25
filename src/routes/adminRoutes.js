const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// All admin routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel endpoints
 */

/**
 * @swagger
 * /api/admin/stats/users:
 *   get:
 *     summary: Get user statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats (total, active, premium, online)
 */
router.get('/stats/users', adminController.statsUsers);

/**
 * @swagger
 * /api/admin/stats/matches:
 *   get:
 *     summary: Get match statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Match stats (total, mutual)
 */
router.get('/stats/matches', adminController.statsMatches);

/**
 * @swagger
 * /api/admin/stats/bookings:
 *   get:
 *     summary: Get booking statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking stats (total, pending, accepted)
 */
router.get('/stats/bookings', adminController.statsBookings);

/**
 * @swagger
 * /api/admin/stats/calls:
 *   get:
 *     summary: Get call statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call stats (total, ongoing)
 */
router.get('/stats/calls', adminController.statsCalls);

/**
 * @swagger
 * /api/admin/stats/orders:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order stats (total, revenue)
 */
router.get('/stats/orders', adminController.statsOrders);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get paginated users list
 *     tags: [Admin]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated users list
 */
router.get('/users', adminController.getUsers);

/**
 * @swagger
 * /api/admin/matches:
 *   get:
 *     summary: Get paginated matches list
 *     tags: [Admin]
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [like, super_like, mutual_match, hidden, blocked]
 *     responses:
 *       200:
 *         description: Paginated matches list
 */
router.get('/matches', adminController.getMatches);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get paginated bookings list
 *     tags: [Admin]
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
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, completed]
 *     responses:
 *       200:
 *         description: Paginated bookings list
 */
router.get('/bookings', adminController.getBookings);

/**
 * @swagger
 * /api/admin/calls:
 *   get:
 *     summary: Get paginated calls list
 *     tags: [Admin]
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
 *           default: 10
 *       - in: query
 *         name: callType
 *         schema:
 *           type: string
 *           enum: [voice, video]
 *     responses:
 *       200:
 *         description: Paginated calls list
 */
router.get('/calls', adminController.getCalls);

/**
 * @swagger
 * /api/admin/messages:
 *   get:
 *     summary: Get paginated messages list
 *     tags: [Admin]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated messages list
 */
router.get('/messages', adminController.getMessages);

/**
 * @swagger
 * /api/admin/shop/products:
 *   get:
 *     summary: Get paginated shop products
 *     tags: [Admin]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated products list
 */
router.get('/shop/products', adminController.getShopProducts);

/**
 * @swagger
 * /api/admin/shop/categories:
 *   get:
 *     summary: Get paginated shop categories
 *     tags: [Admin]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated categories list
 */
router.get('/shop/categories', adminController.getShopCategories);

/**
 * @swagger
 * /api/admin/shop/orders:
 *   get:
 *     summary: Get paginated shop orders
 *     tags: [Admin]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated orders list
 */
router.get('/shop/orders', adminController.getShopOrders);

/**
 * @swagger
 * /api/admin/wallet/transactions:
 *   get:
 *     summary: Get paginated wallet transactions
 *     tags: [Admin]
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
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [recharge, chat, voice_call, video_call, gift, refund]
 *     responses:
 *       200:
 *         description: Paginated wallet transactions
 */
router.get('/wallet/transactions', adminController.getWalletTransactions);

module.exports = router;
