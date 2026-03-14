const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/users/{userId}/badges:
 *   get:
 *     summary: Get all badges for a user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 */
router.get('/:userId/badges', authMiddleware, badgeController.getUserBadges);

/**
 * @swagger
 * /api/users/{userId}/badges:
 *   post:
 *     summary: Assign a badge to a user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - badgeId
 *             properties:
 *               badgeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Badge assigned successfully
 *       400:
 *         description: Bad request
 */
router.post('/:userId/badges', authMiddleware, badgeController.assignBadge);

/**
 * @swagger
 * /api/users/{userId}/badges/{badgeId}:
 *   delete:
 *     summary: Remove a badge from a user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Badge removed successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:userId/badges/:badgeId', authMiddleware, badgeController.removeBadge);

module.exports = router;
