const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking system for online users — request a meeting with time & purpose
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         requesterId:
 *           type: integer
 *         receiverId:
 *           type: integer
 *         bookingDate:
 *           type: string
 *           format: date
 *           example: "2025-07-20"
 *         bookingTime:
 *           type: string
 *           example: "14:30:00"
 *         purpose:
 *           type: string
 *           example: "Want to have a coffee chat"
 *         note:
 *           type: string
 *           example: "Looking forward to meeting you!"
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, completed]
 *         respondedAt:
 *           type: string
 *           format: date-time
 *         rejectionReason:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         Requester:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             profilePicture:
 *               type: string
 *         Receiver:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             profilePicture:
 *               type: string
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking request
 *     description: Send a booking request to another online user with date, time and purpose. Notifies receiver via Socket.IO event `booking:new_request`.
 *     tags: [Bookings]
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
 *               - bookingDate
 *               - bookingTime
 *               - purpose
 *             properties:
 *               receiverId:
 *                 type: integer
 *                 example: 5
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-20"
 *               bookingTime:
 *                 type: string
 *                 example: "14:30"
 *               purpose:
 *                 type: string
 *                 example: "Coffee chat"
 *               note:
 *                 type: string
 *                 example: "Looking forward to it!"
 *     responses:
 *       201:
 *         description: Booking request sent
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request
 */
router.post('/', bookingController.createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings
 *     description: Retrieve paginated bookings for the authenticated user. Filter by status or type (sent/received).
 *     tags: [Bookings]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, completed]
 *         description: Filter by booking status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Filter by sent (you requested) or received (others requested you)
 *     responses:
 *       200:
 *         description: Bookings retrieved
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
 *                         bookings:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Booking'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 */
router.get('/', bookingController.getBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get booking details
 *     description: Get details of a specific booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking details retrieved
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 */
router.get('/:bookingId', bookingController.getBookingById);

/**
 * @swagger
 * /api/bookings/{bookingId}/accept:
 *   put:
 *     summary: Accept a booking request
 *     description: Accept a pending booking request. Only the receiver can accept. Notifies requester via Socket.IO event `booking:accepted`.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking accepted
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot accept this booking
 */
router.put('/:bookingId/accept', bookingController.acceptBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/reject:
 *   put:
 *     summary: Reject a booking request
 *     description: Reject a pending booking request. Only the receiver can reject. Notifies requester via Socket.IO event `booking:rejected`.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 example: "Not available at that time"
 *     responses:
 *       200:
 *         description: Booking rejected
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot reject this booking
 */
router.put('/:bookingId/reject', bookingController.rejectBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     description: Cancel a pending or accepted booking. Only the requester can cancel. Notifies receiver via Socket.IO event `booking:cancelled`.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot cancel this booking
 */
router.put('/:bookingId/cancel', bookingController.cancelBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/complete:
 *   put:
 *     summary: Mark booking as completed
 *     description: Mark an accepted booking as completed. Either participant can complete. Notifies the other user via Socket.IO event `booking:completed`.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Booking completed
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
 *                         booking:
 *                           $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Cannot complete this booking
 */
router.put('/:bookingId/complete', bookingController.completeBooking);

module.exports = router;
