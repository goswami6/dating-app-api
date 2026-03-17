const express = require('express');
const router = express.Router();
const matchCriteriaController = require('../controllers/matchCriteriaController');
const authMiddleware = require('../middleware/authMiddleware');

// All match-criteria routes require authentication

/**
 * @swagger
 * tags:
 *   name: MatchCriteria
 *   description: Match criteria / preference endpoints
 */

/**
 * @swagger
 * /api/match-criteria/options:
 *   get:
 *     summary: Get all match criteria dropdown options
 *     description: Returns all available options for match criteria fields (relationship goals, pronouns, languages, zodiac signs, education levels, etc.). No authentication required.
 *     tags: [MatchCriteria]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: All match criteria options
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
 *                         relationship_goals:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               icon:
 *                                 type: string
 *                         pronouns:
 *                           type: array
 *                           items:
 *                             type: string
 *                         languages:
 *                           type: array
 *                           items:
 *                             type: string
 *                         zodiac_signs:
 *                           type: array
 *                           items:
 *                             type: string
 *                         education_levels:
 *                           type: array
 *                           items:
 *                             type: string
 *                         sexual_orientations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               description:
 *                                 type: string
 */
router.get('/options', matchCriteriaController.getOptions);

router.use(authMiddleware);

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
