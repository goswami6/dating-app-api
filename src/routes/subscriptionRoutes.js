const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Premium subscription management endpoints
 */

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get all available subscription plans
 *     description: Returns all active subscription plans (Plus, Gold, Platinum) with weekly pricing in INR
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         example: Tinder Gold
 *                       tagline:
 *                         type: string
 *                         example: See Who Likes You and match with them instantly
 *                       duration:
 *                         type: integer
 *                         example: 7
 *                         description: Duration in days (7 = weekly)
 *                       price:
 *                         type: number
 *                         example: 159
 *                       currency:
 *                         type: string
 *                         example: INR
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Unlimited Likes", "See Who Likes You", "Unlimited Rewinds"]
 *                       isActive:
 *                         type: boolean
 */
router.get('/plans', authMiddleware, subscriptionController.getPlans);

/**
 * @swagger
 * /api/subscriptions/buy:
 *   post:
 *     summary: Buy a subscription plan
 *     tags: [Subscriptions]
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
 *               - planId
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: ID of the subscription plan to purchase
 *     responses:
 *       201:
 *         description: Subscription purchased successfully
 *       400:
 *         description: Bad request or already subscribed
 */
router.post('/buy', authMiddleware, subscriptionController.buyPlan);

/**
 * @swagger
 * /api/subscriptions/status:
 *   get:
 *     summary: Get current subscription status
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
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
 *                         subscribed:
 *                           type: boolean
 *                         plan:
 *                           $ref: '#/components/schemas/SubscriptionPlan'
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         daysRemaining:
 *                           type: integer
 */
router.get('/status', authMiddleware, subscriptionController.getStatus);

module.exports = router;
