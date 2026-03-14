const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discoveryController');
const authMiddleware = require('../middleware/authMiddleware');

// All discovery routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Discovery
 *   description: Discovery / Swipe screen endpoints
 */

/**
 * @swagger
 * /api/discovery/users:
 *   get:
 *     summary: Get users for swipe screen
 *     description: Returns discoverable user profiles filtered by the authenticated user's preferences (age, gender, distance, online status). Excludes already liked/matched users and incognito users.
 *     tags: [Discovery]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of profiles per page
 *     responses:
 *       200:
 *         description: Discovery profiles retrieved successfully
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
 *                         profiles:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: integer
 *                                 example: 5
 *                               firstName:
 *                                 type: string
 *                                 example: "Priya"
 *                               lastName:
 *                                 type: string
 *                                 example: "Sharma"
 *                               age:
 *                                 type: integer
 *                                 example: 25
 *                               gender:
 *                                 type: string
 *                                 example: "female"
 *                               profilePicture:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               location:
 *                                 type: string
 *                                 example: "Mumbai"
 *                               bio:
 *                                 type: string
 *                               interests:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               occupation:
 *                                 type: string
 *                               education:
 *                                 type: string
 *                               isOnline:
 *                                 type: boolean
 *                               isPremium:
 *                                 type: boolean
 *                               badges:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *       500:
 *         description: Server error
 */
router.get('/users', discoveryController.getDiscoverableUsers);

/**
 * @swagger
 * /api/discovery/location:
 *   post:
 *     summary: Update user's location
 *     description: Updates the authenticated user's location for discovery purposes.
 *     tags: [Discovery]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 example: "Mumbai, India"
 *                 description: City/area name
 *               latitude:
 *                 type: number
 *                 example: 19.076
 *                 description: GPS latitude
 *               longitude:
 *                 type: number
 *                 example: 72.8777
 *                 description: GPS longitude
 *     responses:
 *       200:
 *         description: Location updated successfully
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
 *                         location:
 *                           type: string
 *                         latitude:
 *                           type: number
 *                         longitude:
 *                           type: number
 *       400:
 *         description: Bad request
 */
router.post('/location', discoveryController.updateLocation);

/**
 * @swagger
 * /api/discovery/settings:
 *   get:
 *     summary: Get discovery settings
 *     description: Returns the authenticated user's discovery/filter preferences.
 *     tags: [Discovery]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Discovery settings retrieved successfully
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
 *                         minAge:
 *                           type: integer
 *                           example: 18
 *                         maxAge:
 *                           type: integer
 *                           example: 50
 *                         maxDistance:
 *                           type: number
 *                           example: 50
 *                         gender:
 *                           type: string
 *                           enum: [male, female, other, all]
 *                           example: "all"
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: string
 *                         onlineOnly:
 *                           type: boolean
 *                           example: false
 *                         incognitoMode:
 *                           type: boolean
 *                           example: false
 */
router.get('/settings', discoveryController.getSettings);

/**
 * @swagger
 * /api/discovery/settings:
 *   put:
 *     summary: Update discovery settings
 *     description: Updates the authenticated user's discovery/filter preferences.
 *     tags: [Discovery]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minAge:
 *                 type: integer
 *                 example: 20
 *               maxAge:
 *                 type: integer
 *                 example: 35
 *               maxDistance:
 *                 type: number
 *                 example: 25
 *                 description: Maximum distance in km
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, all]
 *                 example: "female"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["travel", "music", "fitness"]
 *               onlineOnly:
 *                 type: boolean
 *                 example: false
 *               incognitoMode:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Discovery settings updated successfully
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
 *                         minAge:
 *                           type: integer
 *                         maxAge:
 *                           type: integer
 *                         maxDistance:
 *                           type: number
 *                         gender:
 *                           type: string
 *                         interests:
 *                           type: array
 *                           items:
 *                             type: string
 *                         onlineOnly:
 *                           type: boolean
 *                         incognitoMode:
 *                           type: boolean
 *       400:
 *         description: Bad request
 */
router.put('/settings', discoveryController.updateSettings);

module.exports = router;
