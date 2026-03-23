const express = require('express');
const router = express.Router();
const shopProductController = require('../controllers/shopProductController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Shop Products
 *   description: E-commerce product browsing and management
 */

/**
 * @swagger
 * /api/shop/products:
 *   get:
 *     summary: Get all products with filters
 *     tags: [Shop Products]
 *     security:
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, rating, name]
 *           default: newest
 *     responses:
 *       200:
 *         description: Products retrieved
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
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ShopProduct'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             totalItems:
 *                               type: integer
 */
router.get('/', shopProductController.getAll);

/**
 * @swagger
 * /api/shop/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Shop Products]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Featured products retrieved
 */
router.get('/featured', shopProductController.getFeatured);

/**
 * @swagger
 * /api/shop/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Shop Products]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products retrieved
 */
router.get('/category/:categoryId', shopProductController.getByCategory);

/**
 * @swagger
 * /api/shop/products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Shop Products]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', shopProductController.getBySlug);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Shop Products]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product retrieved
 *       404:
 *         description: Product not found
 */
router.get('/:id', shopProductController.getById);

/**
 * @swagger
 * /api/shop/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Shop Products]
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
 *               - categoryId
 *               - name
 *               - price
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Red Rose Bouquet
 *               description:
 *                 type: string
 *                 example: A beautiful bouquet of 12 red roses
 *               shortDescription:
 *                 type: string
 *                 example: 12 Red Roses
 *               price:
 *                 type: number
 *                 example: 799
 *               compareAtPrice:
 *                 type: number
 *                 example: 999
 *               currency:
 *                 type: string
 *                 example: INR
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/rose1.jpg"]
 *               thumbnail:
 *                 type: string
 *                 example: https://example.com/rose-thumb.jpg
 *               sku:
 *                 type: string
 *                 example: ROSE-RED-12
 *               stock:
 *                 type: integer
 *                 example: 50
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["roses", "romantic", "valentine"]
 *               attributes:
 *                 type: object
 *                 example: {"color": "Red", "size": "Large"}
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, shopProductController.create);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Shop Products]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Error
 */
router.put('/:id', authMiddleware, shopProductController.update);

/**
 * @swagger
 * /api/shop/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Shop Products]
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
 *         description: Product deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', authMiddleware, shopProductController.delete);

module.exports = router;
