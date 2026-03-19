const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Calls
 *   description: Voice and Video call endpoints (WebRTC signaling via Socket.IO)
 */

/**
 * @swagger
 * /api/calls/initiate:
 *   post:
 *     summary: Initiate a voice or video call
 *     description: Start a call with a matched user. Sends real-time notification via Socket.IO.
 *     tags: [Calls]
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
 *               - receiverId
 *               - matchId
 *               - callType
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 example: 5
 *               matchId:
 *                 type: integer
 *                 example: 12
 *               callType:
 *                 type: string
 *                 enum: [voice, video]
 *                 example: video
 *     responses:
 *       201:
 *         description: Call initiated successfully
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 *       400:
 *         description: Bad request
 */
router.post('/initiate', callController.initiateCall);

/**
 * @swagger
 * /api/calls/history:
 *   get:
 *     summary: Get call history
 *     description: Retrieve paginated call history for the authenticated user
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *         name: callType
 *         schema:
 *           type: string
 *           enum: [voice, video]
 *         description: Filter by call type
 *     responses:
 *       200:
 *         description: Call history retrieved
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
 *                         calls:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Call'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 */
router.get('/history', callController.getCallHistory);

/**
 * @swagger
 * /api/calls/active:
 *   get:
 *     summary: Get active call
 *     description: Check if the user has an active (ringing or ongoing) call
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Active call status
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 */
router.get('/active', callController.getActiveCall);

/**
 * @swagger
 * /api/calls/match/{matchId}:
 *   get:
 *     summary: Get call history for a specific match
 *     description: Retrieve all calls between you and a matched user
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
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
 *     responses:
 *       200:
 *         description: Match call history retrieved
 */
router.get('/match/:matchId', callController.getMatchCallHistory);

/**
 * @swagger
 * /api/calls/{callId}:
 *   get:
 *     summary: Get call details
 *     description: Get details of a specific call
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Call details retrieved
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 *       404:
 *         description: Call not found
 */
router.get('/:callId', callController.getCallById);

/**
 * @swagger
 * /api/calls/{callId}/answer:
 *   put:
 *     summary: Answer an incoming call
 *     description: Accept an incoming call. Only the receiver can answer. Notifies caller via Socket.IO.
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Call answered
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 *       400:
 *         description: Cannot answer this call
 */
router.put('/:callId/answer', callController.answerCall);

/**
 * @swagger
 * /api/calls/{callId}/reject:
 *   put:
 *     summary: Reject an incoming call
 *     description: Reject an incoming call. Only the receiver can reject. Notifies caller via Socket.IO.
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Call rejected
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 *       400:
 *         description: Cannot reject this call
 */
router.put('/:callId/reject', callController.rejectCall);

/**
 * @swagger
 * /api/calls/{callId}/end:
 *   put:
 *     summary: End an active call
 *     description: End a ringing or ongoing call. Either participant can end. Notifies the other user via Socket.IO.
 *     tags: [Calls]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Call ended
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
 *                         call:
 *                           $ref: '#/components/schemas/Call'
 *       400:
 *         description: Cannot end this call
 */
router.put('/:callId/end', callController.endCall);

module.exports = router;
