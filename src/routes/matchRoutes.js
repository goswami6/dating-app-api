const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

// All match routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match and messaging endpoints
 */

/**
 * @swagger
 * /api/matches/like:
 *   post:
 *     summary: Like a user (initiate match)
 *     description: Like a user. If the other user has already liked you, it becomes a mutual match.
 *     tags: [Matches]
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
 *               - matchedUserId
 *             properties:
 *               matchedUserId:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the user to like
 *     responses:
 *       201:
 *         description: Like sent successfully
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
 *                         match:
 *                           $ref: '#/components/schemas/Match'
 *                         isMutual:
 *                           type: boolean
 *                           example: false
 *       200:
 *         description: It's a mutual match!
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/like', matchController.likeUser);

/**
 * @swagger
 * /api/matches/super-like:
 *   post:
 *     summary: Super like a user
 *     description: Super like a user. If the other user has already liked/super-liked you, it becomes a mutual match with super like flag.
 *     tags: [Matches]
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
 *               - matchedUserId
 *             properties:
 *               matchedUserId:
 *                 type: integer
 *                 example: 2
 *                 description: The ID of the user to super like
 *     responses:
 *       201:
 *         description: Super like sent successfully
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
 *                         match:
 *                           $ref: '#/components/schemas/Match'
 *                         isMutual:
 *                           type: boolean
 *                           example: false
 *                         isSuperLike:
 *                           type: boolean
 *                           example: true
 *       200:
 *         description: It's a super match!
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/super-like', matchController.superLikeUser);

/**
 * @swagger
 * /api/matches/liked:
 *   get:
 *     summary: Get profiles liked by the authenticated user
 *     description: Returns all profiles that the user has liked (status = 'like'). Once matched, they move to the mutual matches list.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Liked profiles retrieved successfully
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
 *                         totalLikes:
 *                           type: integer
 *                           example: 5
 *                         profiles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LikedProfile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/liked', matchController.getLikedProfiles);

/**
 * @swagger
 * /api/matches/super-liked:
 *   get:
 *     summary: Get profiles super liked by the authenticated user
 *     description: Returns all profiles that the user has super liked (status = 'super_like'). Once matched, they move to the mutual matches list.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Super liked profiles retrieved successfully
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
 *                         totalSuperLikes:
 *                           type: integer
 *                           example: 2
 *                         profiles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/LikedProfile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/super-liked', matchController.getSuperLikedProfiles);

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all mutual matches for the authenticated user
 *     description: Returns all mutual matches with the other user's info and the last message.
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Matches retrieved successfully
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
 *                         totalMatches:
 *                           type: integer
 *                           example: 3
 *                         matches:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MatchListItem'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', matchController.getMatches);

/**
 * @swagger
 * /api/matches/{matchId}:
 *   get:
 *     summary: Get a specific match with messages
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Match retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:matchId', matchController.getMatchById);

/**
 * @swagger
 * /api/matches/{matchId}/messages:
 *   get:
 *     summary: Get all messages for a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:matchId/messages', matchController.getMessages);

/**
 * @swagger
 * /api/matches/{matchId}/messages:
 *   post:
 *     summary: Send a message in a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Hey 👋 nice to match with you!"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:matchId/messages', matchController.sendMessage);

/**
 * @swagger
 * /api/matches/{matchId}/status:
 *   patch:
 *     summary: Update match status (hide or block)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [hidden, blocked]
 *                 example: hidden
 *     responses:
 *       200:
 *         description: Match status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Match'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:matchId/status', matchController.updateStatus);

module.exports = router;
