const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminPaymentController = require('../controllers/adminPaymentController');
const authMiddleware = require('../middleware/authMiddleware');
const apiResponse = require('../utils/apiResponse');

// Admin-only middleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return apiResponse.error(res, 'Access denied. Admin only.', 403);
  }
  next();
};

// All admin routes require authentication + admin check
router.use(authMiddleware);
router.use(adminMiddleware);

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

// ─── Product CRUD ─────────────────────────────────

/**
 * @swagger
 * /api/admin/shop/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, price]
 *             properties:
 *               categoryId: { type: integer }
 *               name: { type: string }
 *               description: { type: string }
 *               shortDescription: { type: string }
 *               price: { type: number }
 *               compareAtPrice: { type: number }
 *               currency: { type: string, default: INR }
 *               images: { type: array, items: { type: string } }
 *               thumbnail: { type: string }
 *               sku: { type: string }
 *               stock: { type: integer }
 *               isActive: { type: boolean }
 *               isFeatured: { type: boolean }
 *               tags: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *               icon: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/shop/products', adminController.createProduct);

/**
 * @swagger
 * /api/admin/shop/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId: { type: integer }
 *               name: { type: string }
 *               description: { type: string }
 *               shortDescription: { type: string }
 *               price: { type: number }
 *               compareAtPrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               thumbnail: { type: string }
 *               sku: { type: string }
 *               stock: { type: integer }
 *               isActive: { type: boolean }
 *               isFeatured: { type: boolean }
 *               tags: { type: array, items: { type: string } }
 *               attributes: { type: object }
 *               icon: { type: string }
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put('/shop/products/:id', adminController.updateProduct);

/**
 * @swagger
 * /api/admin/shop/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete('/shop/products/:id', adminController.deleteProduct);

// ─── Category CRUD ────────────────────────────────

/**
 * @swagger
 * /api/admin/shop/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               image: { type: string }
 *               parentId: { type: integer }
 *               sortOrder: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/shop/categories', adminController.createCategory);

/**
 * @swagger
 * /api/admin/shop/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               image: { type: string }
 *               parentId: { type: integer }
 *               sortOrder: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/shop/categories/:id', adminController.updateCategory);

/**
 * @swagger
 * /api/admin/shop/categories/{id}:
 *   delete:
 *     summary: Delete a category (fails if products exist in it)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/shop/categories/:id', adminController.deleteCategory);

// ─── Order Management ─────────────────────────────

/**
 * @swagger
 * /api/admin/shop/orders/{id}:
 *   get:
 *     summary: Get order detail with items, address and user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order detail
 */
router.get('/shop/orders/:id', adminController.getOrderDetail);

/**
 * @swagger
 * /api/admin/shop/orders/{id}/status:
 *   put:
 *     summary: Update order status / payment status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned, refunded] }
 *               paymentStatus: { type: string, enum: [pending, paid, failed, refunded] }
 *               cancelReason: { type: string }
 *     responses:
 *       200:
 *         description: Order updated
 */
router.put('/shop/orders/:id/status', adminController.updateOrderStatus);

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

// ─── Payment Gateway Management ────────────────────

/**
 * @swagger
 * /api/admin/payments/gateways:
 *   get:
 *     summary: Get Razorpay/PayU gateway configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment gateway config list
 */
router.get('/payments/gateways', adminPaymentController.getGatewayConfigs);

/**
 * @swagger
 * /api/admin/payments/gateways/{gateway}:
 *   put:
 *     summary: Update gateway configuration (enable/disable and credentials)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gateway
 *         required: true
 *         schema:
 *           type: string
 *           enum: [razorpay, payu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               isEnabled:
 *                 type: boolean
 *               isSandbox:
 *                 type: boolean
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: Gateway config updated
 */
router.put('/payments/gateways/:gateway', adminPaymentController.updateGatewayConfig);

/**
 * @swagger
 * /api/admin/payments/orders:
 *   get:
 *     summary: Get payment orders list
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
 *       - in: query
 *         name: purpose
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment orders list
 */
router.get('/payments/orders', adminPaymentController.getPaymentOrders);

/**
 * @swagger
 * /api/admin/payments/orders/{id}/status:
 *   patch:
 *     summary: Update payment order status manually
 *     tags: [Admin]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [created, pending, success, failed, cancelled]
 *               failureReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment order updated
 */
router.patch('/payments/orders/:id/status', adminPaymentController.updatePaymentOrderStatus);

// ─── Subscription Management ──────────────────────

/**
 * @swagger
 * /api/admin/stats/subscriptions:
 *   get:
 *     summary: Get subscription statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription stats (totalPlans, activePlans, totalSubscribers, activeSubscribers)
 */
router.get('/stats/subscriptions', adminController.statsSubscriptions);

/**
 * @swagger
 * /api/admin/subscriptions/plans:
 *   get:
 *     summary: Get paginated subscription plans
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
 *         description: Paginated subscription plans list
 */
router.get('/subscriptions/plans', adminController.getSubscriptionPlans);

/**
 * @swagger
 * /api/admin/subscriptions/plans:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, duration, price]
 *             properties:
 *               name:
 *                 type: string
 *               tagline:
 *                 type: string
 *               duration:
 *                 type: integer
 *                 description: Duration in days
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: INR
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post('/subscriptions/plans', adminController.createSubscriptionPlan);

/**
 * @swagger
 * /api/admin/subscriptions/plans/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               name:
 *                 type: string
 *               tagline:
 *                 type: string
 *               duration:
 *                 type: integer
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put('/subscriptions/plans/:id', adminController.updateSubscriptionPlan);

/**
 * @swagger
 * /api/admin/subscriptions/plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plan deleted
 */
router.delete('/subscriptions/plans/:id', adminController.deleteSubscriptionPlan);

/**
 * @swagger
 * /api/admin/subscriptions:
 *   get:
 *     summary: Get paginated user subscriptions
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
 *           enum: [active, expired, cancelled]
 *     responses:
 *       200:
 *         description: Paginated user subscriptions list
 */
router.get('/subscriptions', adminController.getSubscriptions);

// ─── Badge Management ─────────────────────────────────

/**
 * @swagger
 * /api/admin/stats/badges:
 *   get:
 *     summary: Get badge statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge stats (totalBadges, totalAwarded, premiumBadges)
 */
router.get('/stats/badges', adminController.statsBadges);

/**
 * @swagger
 * /api/admin/badges:
 *   get:
 *     summary: Get all badges (paginated)
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
 *         description: Paginated badges list
 */
router.get('/badges', adminController.getBadges);

/**
 * @swagger
 * /api/admin/badges:
 *   post:
 *     summary: Create a new badge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, icon]
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               requiredMonth:
 *                 type: integer
 *               color:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Badge created
 */
router.post('/badges', adminController.createBadge);

/**
 * @swagger
 * /api/admin/badges/{id}:
 *   put:
 *     summary: Update a badge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               requiredMonth:
 *                 type: integer
 *               color:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Badge updated
 */
router.put('/badges/:id', adminController.updateBadge);

/**
 * @swagger
 * /api/admin/badges/{id}:
 *   delete:
 *     summary: Delete a badge
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Badge deleted
 */
router.delete('/badges/:id', adminController.deleteBadge);

/**
 * @swagger
 * /api/admin/badges/users:
 *   get:
 *     summary: Get user-badge assignments (award history)
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
 *         name: badgeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User badges list
 */
router.get('/badges/users', adminController.getUserBadges);

/**
 * @swagger
 * /api/admin/badges/award:
 *   post:
 *     summary: Award a badge to a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, badgeId]
 *             properties:
 *               userId:
 *                 type: integer
 *               badgeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Badge awarded
 */
router.post('/badges/award', adminController.awardBadge);

/**
 * @swagger
 * /api/admin/badges/revoke/{userId}/{badgeId}:
 *   delete:
 *     summary: Revoke a badge from a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Badge revoked
 */
router.delete('/badges/revoke/:userId/:badgeId', adminController.revokeBadge);

module.exports = router;
