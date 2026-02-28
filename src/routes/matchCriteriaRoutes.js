const express = require('express');
const router = express.Router();
const matchCriteriaController = require('../controllers/matchCriteriaController');
const authMiddleware = require('../middleware/authMiddleware');

// All match-criteria routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: MatchCriteria
 *   description: Match criteria / preference endpoints
 */

/**
 * @swagger
 * /api/match-criteria:
 *   get:
 *     summary: Get match criteria for authenticated user
 *     description: Returns the user's match criteria preferences. If none set, returns defaults.
 *     tags: [MatchCriteria]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Match criteria retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MatchCriteria'
 */
router.get('/', matchCriteriaController.getCriteria);

/**
 * @swagger
 * /api/match-criteria:
 *   put:
 *     summary: Set or update match criteria
 *     description: Create or update match preferences for the authenticated user. Only provided fields are updated.
 *     tags: [MatchCriteria]
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
 *                 minimum: 18
 *                 example: 20
 *               maxAge:
 *                 type: integer
 *                 example: 35
 *               maxDistance:
 *                 type: number
 *                 format: float
 *                 example: 25.0
 *                 description: Maximum distance in km
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["travel", "music", "fitness"]
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, all]
 *                 example: "all"
 *               onlineOnly:
 *                 type: boolean
 *                 example: false
 *               incognitoMode:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Match criteria updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MatchCriteria'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/', matchCriteriaController.setCriteria);

/**
 * @swagger
 * /api/match-criteria:
 *   delete:
 *     summary: Reset match criteria to defaults
 *     description: Deletes the user's custom match criteria, reverting to default values.
 *     tags: [MatchCriteria]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Match criteria reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: No criteria found to reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', matchCriteriaController.resetCriteria);

module.exports = router;
