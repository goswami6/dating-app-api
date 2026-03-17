const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const { chatMediaUpload } = require('../middleware/upload');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging and chat endpoints
 */

/**
 * @swagger
 * /api/messages/chat-list:
 *   get:
 *     summary: Get chat list
 *     description: Returns all conversations for the authenticated user with latest message and unread count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Chat list retrieved
 */
router.get('/chat-list', messageController.getChatList);

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get total unread message count
 *     description: Returns unread message count per conversation and total
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 */
router.get('/unread-count', messageController.getUnreadCount);

/**
 * @swagger
 * /api/messages/search:
 *   get:
 *     summary: Search messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match/conversation ID
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *         description: Search results
 */
router.get('/search', messageController.searchMessages);

/**
 * @swagger
 * /api/messages/send-image:
 *   post:
 *     summary: Send an image message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - media
 *             properties:
 *               matchId:
 *                 type: integer
 *               media:
 *                 type: string
 *                 format: binary
 *               text:
 *                 type: string
 *                 description: Optional caption
 *     responses:
 *       201:
 *         description: Image sent
 */
router.post('/send-image', chatMediaUpload.single('media'), messageController.sendImage);

/**
 * @swagger
 * /api/messages/send-gif:
 *   post:
 *     summary: Send a GIF message
 *     tags: [Messages]
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
 *               - matchId
 *               - gifUrl
 *             properties:
 *               matchId:
 *                 type: integer
 *               gifUrl:
 *                 type: string
 *                 description: URL of the GIF
 *               text:
 *                 type: string
 *                 description: Optional caption
 *     responses:
 *       201:
 *         description: GIF sent
 */
router.post('/send-gif', messageController.sendGif);

/**
 * @swagger
 * /api/messages/send-voice:
 *   post:
 *     summary: Send a voice message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - media
 *             properties:
 *               matchId:
 *                 type: integer
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Voice message sent
 */
router.post('/send-voice', chatMediaUpload.single('media'), messageController.sendVoice);

/**
 * @swagger
 * /api/messages/read:
 *   put:
 *     summary: Mark messages as read
 *     description: Marks all unread messages in a conversation as read
 *     tags: [Messages]
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
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put('/read', messageController.markAsRead);

/**
 * @swagger
 * /api/messages/delivered:
 *   put:
 *     summary: Mark messages as delivered
 *     tags: [Messages]
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
 *               - messageIds
 *             properties:
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Messages marked as delivered
 */
router.put('/delivered', messageController.markAsDelivered);

/**
 * @swagger
 * /api/messages/typing:
 *   post:
 *     summary: Send typing indicator
 *     tags: [Messages]
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
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Typing indicator sent
 */
router.post('/typing', messageController.typingIndicator);

/**
 * @swagger
 * /api/messages/react:
 *   post:
 *     summary: React to a message
 *     tags: [Messages]
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
 *               - messageId
 *               - reaction
 *             properties:
 *               messageId:
 *                 type: integer
 *               reaction:
 *                 type: string
 *                 description: Emoji reaction
 *                 example: "❤️"
 *     responses:
 *       200:
 *         description: Reaction added
 */
router.post('/react', messageController.reactToMessage);

/**
 * @swagger
 * /api/messages/pin:
 *   post:
 *     summary: Pin a message
 *     tags: [Messages]
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
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Message pinned
 */
router.post('/pin', messageController.pinMessage);

/**
 * @swagger
 * /api/messages/report:
 *   post:
 *     summary: Report a message
 *     tags: [Messages]
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
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 description: Reason for reporting
 *     responses:
 *       200:
 *         description: Message reported
 */
router.post('/report', messageController.reportMessage);

/**
 * @swagger
 * /api/messages/forward:
 *   post:
 *     summary: Forward a message to another conversation
 *     tags: [Messages]
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
 *               - messageId
 *               - targetMatchId
 *             properties:
 *               messageId:
 *                 type: integer
 *               targetMatchId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Message forwarded
 */
router.post('/forward', messageController.forwardMessage);

/**
 * @swagger
 * /api/messages/block-user:
 *   post:
 *     summary: Block a user from chat
 *     tags: [Messages]
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
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User blocked from chat
 */
router.post('/block-user', messageController.blockUser);

/**
 * @swagger
 * /api/messages/unblock-user:
 *   post:
 *     summary: Unblock a user from chat
 *     tags: [Messages]
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
 *               - matchId
 *             properties:
 *               matchId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User unblocked
 */
router.post('/unblock-user', messageController.unblockUser);

/**
 * @swagger
 * /api/messages/reply:
 *   post:
 *     summary: Reply to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - replyToId
 *             properties:
 *               matchId:
 *                 type: integer
 *               replyToId:
 *                 type: integer
 *               text:
 *                 type: string
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Optional image attachment
 *     responses:
 *       201:
 *         description: Reply sent
 */
router.post('/reply', chatMediaUpload.single('media'), messageController.replyToMessage);

/**
 * @swagger
 * /api/messages/star:
 *   post:
 *     summary: Star a message
 *     tags: [Messages]
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
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Message starred
 */
router.post('/star', messageController.starMessage);

/**
 * @swagger
 * /api/messages/unpin/{messageId}:
 *   delete:
 *     summary: Unpin a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message unpinned
 */
router.delete('/unpin/:messageId', messageController.unpinMessage);

/**
 * @swagger
 * /api/messages/unstar/{messageId}:
 *   delete:
 *     summary: Unstar a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message unstarred
 */
router.delete('/unstar/:messageId', messageController.unstarMessage);

/**
 * @swagger
 * /api/messages/chat/{matchId}:
 *   delete:
 *     summary: Delete entire conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation deleted
 */
router.delete('/chat/:matchId', messageController.deleteChat);

/**
 * @swagger
 * /api/messages/media/{matchId}:
 *   get:
 *     summary: Get shared media in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Shared media retrieved
 */
router.get('/media/:matchId', messageController.getSharedMedia);

/**
 * @swagger
 * /api/messages/latest/{matchId}:
 *   get:
 *     summary: Get latest message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Latest message retrieved
 */
router.get('/latest/:matchId', messageController.getLatestMessage);

/**
 * @swagger
 * /api/messages/message/{messageId}:
 *   get:
 *     summary: Get a single message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message retrieved
 */
router.get('/message/:messageId', messageController.getMessage);

/**
 * @swagger
 * /api/messages/{matchId}:
 *   get:
 *     summary: Get all messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
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
 *         description: Messages retrieved
 */
router.get('/:matchId', messageController.getMessages);

/**
 * @swagger
 * /api/messages/{messageId}:
 *   put:
 *     summary: Edit a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
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
 *     responses:
 *       200:
 *         description: Message edited
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.put('/:messageId', messageController.editMessage);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
