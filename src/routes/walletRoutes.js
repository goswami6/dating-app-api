const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Wallet recharge, balance, transactions & usage deductions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WalletResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 4
 *         balance:
 *           type: number
 *           example: 150.00
 *         currency:
 *           type: string
 *           example: INR
 *         isActive:
 *           type: boolean
 *           example: true
 *     TransactionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         amount:
 *           type: number
 *           example: 100
 *         type:
 *           type: string
 *           enum: [credit, debit]
 *           example: credit
 *         category:
 *           type: string
 *           enum: [recharge, chat, voice_call, video_call, gift, refund]
 *           example: recharge
 *         status:
 *           type: string
 *           enum: [pending, success, failed]
 *           example: success
 *         paymentMethod:
 *           type: string
 *           example: UPI
 *         description:
 *           type: string
 *           example: "Wallet recharge of ₹100 via UPI"
 *         balanceAfter:
 *           type: number
 *           example: 250.00
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ── All routes require auth ─────────────────────────────
router.use(authMiddleware);

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get wallet details
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet details fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Wallet details fetched
 *                 data:
 *                   $ref: '#/components/schemas/WalletResponse'
 */
router.get('/', walletController.getWallet);

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get current wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: number
 *                       example: 150.00
 *                     currency:
 *                       type: string
 *                       example: INR
 */
router.get('/balance', walletController.getBalance);

/**
 * @swagger
 * /api/wallet/rates:
 *   get:
 *     summary: Get chat & call rates and available recharge amounts
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rates fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatPerSession:
 *                       type: number
 *                       example: 2
 *                     voiceCallPerMinute:
 *                       type: number
 *                       example: 5
 *                     videoCallPerMinute:
 *                       type: number
 *                       example: 10
 *                     currency:
 *                       type: string
 *                       example: INR
 *                     rechargeAmounts:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [5, 20, 50, 100, 200, 500]
 */
router.get('/rates', walletController.getRates);

/**
 * @swagger
 * /api/wallet/can-chat:
 *   get:
 *     summary: Check if user has enough balance to chat
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat eligibility checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     canChat:
 *                       type: boolean
 *                       example: true
 *                     balance:
 *                       type: number
 *                       example: 150.00
 *                     requiredPerMessage:
 *                       type: number
 *                       example: 2
 *                     currency:
 *                       type: string
 *                       example: INR
 */
router.get('/can-chat', walletController.canChat);

/**
 * @swagger
 * /api/wallet/can-call:
 *   get:
 *     summary: Check if user has enough balance to make a call
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [voice, video]
 *           default: voice
 *         description: Call type (voice or video)
 *     responses:
 *       200:
 *         description: Call eligibility checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     canCall:
 *                       type: boolean
 *                       example: true
 *                     callType:
 *                       type: string
 *                       example: voice
 *                     balance:
 *                       type: number
 *                       example: 150.00
 *                     ratePerMinute:
 *                       type: number
 *                       example: 5
 *                     currency:
 *                       type: string
 *                       example: INR
 */
router.get('/can-call', walletController.canCall);

/**
 * @swagger
 * /api/wallet/recharge:
 *   post:
 *     summary: Recharge wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 enum: [5, 20, 50, 100, 200, 500]
 *                 example: 100
 *                 description: "Recharge amount in INR"
 *               paymentMethod:
 *                 type: string
 *                 example: UPI
 *                 default: UPI
 *               referenceId:
 *                 type: string
 *                 example: "upi_ref_abc123"
 *                 description: "External payment reference ID"
 *     responses:
 *       201:
 *         description: Wallet recharged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Wallet recharged with ₹100"
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         balance:
 *                           type: number
 *                           example: 250.00
 *                         currency:
 *                           type: string
 *                           example: INR
 *                     transaction:
 *                       $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Invalid amount or payment error
 */
router.post('/recharge', walletController.recharge);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit, debit]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [recharge, chat, voice_call, video_call, gift, refund]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Transaction history fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TransactionResponse'
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 */
router.get('/transactions', walletController.getTransactions);

/**
 * @swagger
 * /api/wallet/deduct/chat:
 *   post:
 *     summary: Deduct wallet balance for chat message
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: integer
 *                 example: 5
 *                 description: "User ID you are chatting with"
 *     responses:
 *       200:
 *         description: Chat charge deducted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                           example: 148.00
 *                     transaction:
 *                       $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Insufficient balance
 */
router.post('/deduct/chat', walletController.deductForChat);

/**
 * @swagger
 * /api/wallet/deduct/call:
 *   post:
 *     summary: Deduct wallet balance for voice/video call
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - callType
 *               - durationMinutes
 *             properties:
 *               targetUserId:
 *                 type: integer
 *                 example: 5
 *                 description: "User ID you called"
 *               callType:
 *                 type: string
 *                 enum: [voice, video]
 *                 example: voice
 *               durationMinutes:
 *                 type: number
 *                 example: 3.5
 *                 description: "Call duration in minutes"
 *     responses:
 *       200:
 *         description: Call charge deducted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                           example: 130.00
 *                     transaction:
 *                       $ref: '#/components/schemas/TransactionResponse'
 *       400:
 *         description: Insufficient balance or invalid callType
 */
router.post('/deduct/call', walletController.deductForCall);

module.exports = router;
