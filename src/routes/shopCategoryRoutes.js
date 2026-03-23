const express = require('express');
const router = express.Router();
const shopCategoryController = require('../controllers/shopCategoryController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Shop Categories
 *   description: E-commerce product category management
 */

/**
 * @swagger
 * /api/shop/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Include inactive categories (admin use)
 *     responses:
 *       200:
 *         description: Categories retrieved
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
 *                         categories:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ShopCategory'
 */
router.get('/', shopCategoryController.getAll);

/**
 * @swagger
 * /api/shop/categories/top-level:
 *   get:
 *     summary: Get top-level categories (no parent)
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Top-level categories retrieved
 */
router.get('/top-level', shopCategoryController.getTopLevel);

/**
 * @swagger
 * /api/shop/categories/seed:
 *   post:
 *     summary: Seed categories and products with default data
 *     description: Populates the shop with 4 categories (Men, Women, Gifts, Accessories) and 32 products. Safe to call multiple times - skips existing data.
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       201:
 *         description: Data seeded successfully
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
 *                         categories:
 *                           type: integer
 *                           example: 4
 *                         products:
 *                           type: integer
 *                           example: 32
 */
router.post('/seed', shopCategoryController.seedData);

/**
 * @swagger
 * /api/shop/categories/{id}/products:
 *   get:
 *     summary: Get category with all its products
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
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
 *         description: Category with products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       404:
 *         description: Category not found
 */
router.get('/:id/products', shopCategoryController.getCategoryProducts);

/**
 * @swagger
 * /api/shop/categories/slug/{slug}/products:
 *   get:
 *     summary: Get category by slug with all its products
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
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
 *         description: Category products retrieved
 *       404:
 *         description: Category not found
 */
router.get('/slug/:slug/products', shopCategoryController.getCategoryProductsBySlug);

/**
 * @swagger
 * /api/shop/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category retrieved
 *       404:
 *         description: Category not found
 */
router.get('/slug/:slug', shopCategoryController.getBySlug);

/**
 * @swagger
 * /api/shop/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Shop Categories]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved
 *       404:
 *         description: Category not found
 */
router.get('/:id', shopCategoryController.getById);

/**
 * @swagger
 * /api/shop/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Shop Categories]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gifts & Flowers
 *               description:
 *                 type: string
 *                 example: Perfect gifts for your special someone
 *               image:
 *                 type: string
 *                 example: https://example.com/category.jpg
 *               parentId:
 *                 type: integer
 *                 example: null
 *                 description: Parent category ID for subcategories
 *               sortOrder:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, shopCategoryController.create);

/**
 * @swagger
 * /api/shop/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Shop Categories]
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
 *               image:
 *                 type: string
 *               parentId:
 *                 type: integer
 *               sortOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Error
 */
router.put('/:id', authMiddleware, shopCategoryController.update);

/**
 * @swagger
 * /api/shop/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Shop Categories]
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
 *         description: Category deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', authMiddleware, shopCategoryController.delete);

module.exports = router;
