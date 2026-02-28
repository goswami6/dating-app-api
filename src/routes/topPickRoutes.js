const express = require('express');
const router = express.Router();
const topPickController = require('../controllers/topPickController');
const authMiddleware = require('../middleware/authMiddleware');

// All top-picks routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: TopPicks
 *   description: Top picks / daily recommendations endpoints
 */

/**
 * @swagger
 * /api/top-picks:
 *   get:
 *     summary: Get active top picks for authenticated user
 *     description: Returns the user's current top picks. Expired picks are automatically cleaned up.
 *     tags: [TopPicks]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Top picks retrieved successfully
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
 *                         totalPicks:
 *                           type: integer
 *                           example: 10
 *                         picks:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TopPickItem'
 */
router.get('/', topPickController.getTopPicks);

/**
 * @swagger
 * /api/top-picks/generate:
 *   post:
 *     summary: Generate daily top picks
 *     description: Generates random top picks for the user (up to the specified count). Picks expire after 24 hours. Users already matched/liked are excluded.
 *     tags: [TopPicks]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 example: 10
 *                 description: Number of top picks to generate (default 10)
 *     responses:
 *       200:
 *         description: Top picks generated successfully
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
 *                         count:
 *                           type: integer
 *                           example: 10
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate', topPickController.generateTopPicks);

module.exports = router;
