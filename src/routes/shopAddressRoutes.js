const express = require('express');
const router = express.Router();
const shopAddressController = require('../controllers/shopAddressController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Shop Addresses
 *   description: Shipping address management
 */

/**
 * @swagger
 * /api/shop/addresses:
 *   get:
 *     summary: Get all user addresses
 *     tags: [Shop Addresses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved
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
 *                         addresses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ShopAddress'
 */
router.get('/', shopAddressController.getAll);

/**
 * @swagger
 * /api/shop/addresses/{id}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Shop Addresses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address retrieved
 *       404:
 *         description: Address not found
 */
router.get('/:id', shopAddressController.getById);

/**
 * @swagger
 * /api/shop/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Shop Addresses]
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
 *               - fullName
 *               - phone
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *             properties:
 *               label:
 *                 type: string
 *                 example: Home
 *               fullName:
 *                 type: string
 *                 example: Akanksha Sharma
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               addressLine1:
 *                 type: string
 *                 example: 42, Rose Garden
 *               addressLine2:
 *                 type: string
 *                 example: Near City Mall
 *               city:
 *                 type: string
 *                 example: Mumbai
 *               state:
 *                 type: string
 *                 example: Maharashtra
 *               postalCode:
 *                 type: string
 *                 example: "400001"
 *               country:
 *                 type: string
 *                 example: India
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address created
 *       400:
 *         description: Validation error
 */
router.post('/', shopAddressController.create);

/**
 * @swagger
 * /api/shop/addresses/{id}:
 *   put:
 *     summary: Update an address
 *     tags: [Shop Addresses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated
 *       400:
 *         description: Error
 */
router.put('/:id', shopAddressController.update);

/**
 * @swagger
 * /api/shop/addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Shop Addresses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Address deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', shopAddressController.delete);

/**
 * @swagger
 * /api/shop/addresses/{id}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Shop Addresses]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Default address set
 *       400:
 *         description: Error
 */
router.put('/:id/default', shopAddressController.setDefault);

module.exports = router;
