const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const onlineUsersController = require('../controllers/onlineUsersController');

/**
 * @swagger
 * tags:
 *   name: Online Users
 *   description: Discover online users and chat/call them using wallet balance (no match required)
 */

/**
 * @swagger
 * /api/online-users:
 *   get:
 *     summary: Get currently online users
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
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
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, non-binary, other]
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of online users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           age:
 *                             type: integer
 *                           gender:
 *                             type: string
 *                           location:
 *                             type: string
 *                           bio:
 *                             type: string
 *                           interests:
 *                             type: array
 *                             items:
 *                               type: string
 *                           occupation:
 *                             type: string
 *                           isOnline:
 *                             type: boolean
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', authMiddleware, onlineUsersController.getOnlineUsers);

/**
 * @swagger
 * /api/online-users/{userId}/start-chat:
 *   post:
 *     summary: Start a chat session with an online user (wallet required)
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target user ID to start chat with
 *     responses:
 *       201:
 *         description: Chat session started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     targetUser:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         profilePicture:
 *                           type: string
 *                         isOnline:
 *                           type: boolean
 *                     startedAt:
 *                       type: string
 *                       format: date-time
 *       402:
 *         description: Insufficient wallet balance
 *       404:
 *         description: User not found
 */
router.post('/:userId/start-chat', authMiddleware, onlineUsersController.startChat);

/**
 * @swagger
 * /api/online-users/chat/{chatId}/message:
 *   post:
 *     summary: Send a message in a random chat session (₹2 per message from wallet)
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
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
 *                 example: "Hey! How are you?"
 *     responses:
 *       201:
 *         description: Message sent and wallet deducted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     chatId:
 *                       type: integer
 *                     senderId:
 *                       type: integer
 *                     text:
 *                       type: string
 *                     sentAt:
 *                       type: string
 *                       format: date-time
 *                     walletDeducted:
 *                       type: number
 *                       example: 2
 *       402:
 *         description: Insufficient wallet balance
 *       404:
 *         description: Chat not found
 */
router.post('/chat/:chatId/message', authMiddleware, onlineUsersController.sendMessage);

/**
 * @swagger
 * /api/online-users/chat/{chatId}/messages:
 *   get:
 *     summary: Get messages from a random chat session
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages fetched
 *       404:
 *         description: Chat not found or not authorized
 */
router.get('/chat/:chatId/messages', authMiddleware, onlineUsersController.getMessages);

/**
 * @swagger
 * /api/online-users/my-chats:
 *   get:
 *     summary: Get all my active random chat sessions
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
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
 *         description: List of active chats
 */
router.get('/my-chats', authMiddleware, onlineUsersController.getMyChats);

/**
 * @swagger
 * /api/online-users/chat/{chatId}/end:
 *   put:
 *     summary: End a random chat session
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chat ended
 *       404:
 *         description: Chat not found or not authorized
 */
router.put('/chat/:chatId/end', authMiddleware, onlineUsersController.endChat);

/**
 * @swagger
 * /api/online-users/{userId}/call:
 *   post:
 *     summary: Initiate a call with an online user (wallet required, no match needed)
 *     tags: [Online Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target user ID to call
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - callType
 *             properties:
 *               callType:
 *                 type: string
 *                 enum: [voice, video]
 *                 example: voice
 *     responses:
 *       200:
 *         description: Call can be initiated (proceed via socket)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     callerId:
 *                       type: integer
 *                     receiverId:
 *                       type: integer
 *                     callType:
 *                       type: string
 *                     canCall:
 *                       type: boolean
 *                     isReceiverOnline:
 *                       type: boolean
 *       402:
 *         description: Insufficient wallet balance
 *       404:
 *         description: User not found
 */
router.post('/:userId/call', authMiddleware, onlineUsersController.initiateCall);

module.exports = router;
