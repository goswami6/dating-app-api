const express = require('express');
const router = express.Router();
const swipeController = require('../controllers/swipeController');
const authMiddleware = require('../middleware/authMiddleware');

// All swipe routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Swipes
 *   description: Swipe history endpoints
 */

/**
 * @swagger
 * /api/swipes/history:
 *   get:
 *     summary: Get swipe history
 *     description: Returns the authenticated user's swipe history including likes sent, received, super likes, and mutual matches with the other user's profile details.
 *     tags: [Swipes]
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
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [like, super_like, mutual_match, hidden, blocked]
 *         description: Filter by swipe status
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Filter by direction — sent (you swiped) or received (swiped on you)
 *     responses:
 *       200:
 *         description: Swipe history retrieved successfully
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
 *                         history:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               matchId:
 *                                 type: integer
 *                                 example: 1
 *                               direction:
 *                                 type: string
 *                                 enum: [sent, received]
 *                                 example: "sent"
 *                               status:
 *                                 type: string
 *                                 example: "like"
 *                               isSuperLike:
 *                                 type: boolean
 *                                 example: false
 *                               matchedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   userId:
 *                                     type: integer
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                                   age:
 *                                     type: integer
 *                                   profilePicture:
 *                                     type: string
 *                                   images:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *                                   location:
 *                                     type: string
 *                                   isOnline:
 *                                     type: boolean
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
router.get('/history', swipeController.getSwipeHistory);

module.exports = router;
