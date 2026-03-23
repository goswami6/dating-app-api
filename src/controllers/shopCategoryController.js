const shopCategoryService = require('../services/shopCategoryService');
const apiResponse = require('../utils/apiResponse');

class ShopCategoryController {
  async getAll(req, res) {
    try {
      const categories = await shopCategoryService.getAllCategories(req.query.includeInactive === 'true');
      const formatted = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        products: (cat.Products || []).map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          currency: p.currency,
          icon: p.icon || '📦',
          description: p.shortDescription,
          image: p.images && p.images.length ? p.images[0] : p.thumbnail,
          stock: p.stock,
          isFeatured: p.isFeatured,
          tags: p.tags,
          avgRating: p.avgRating,
        })),
        productCount: (cat.Products || []).length,
      }));
      return apiResponse.success(res, 'Categories retrieved', { categories: formatted });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getTopLevel(req, res) {
    try {
      const categories = await shopCategoryService.getTopLevelCategories();
      const formatted = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        products: (cat.Products || []).map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          currency: p.currency,
          icon: p.icon || '📦',
          description: p.shortDescription,
          image: p.images && p.images.length ? p.images[0] : p.thumbnail,
          stock: p.stock,
          isFeatured: p.isFeatured,
          tags: p.tags,
          avgRating: p.avgRating,
        })),
        productCount: (cat.Products || []).length,
      }));
      return apiResponse.success(res, 'Top-level categories retrieved', { categories: formatted });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const category = await shopCategoryService.getCategoryById(parseInt(req.params.id));
      return apiResponse.success(res, 'Category retrieved', { category });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getBySlug(req, res) {
    try {
      const category = await shopCategoryService.getCategoryBySlug(req.params.slug);
      return apiResponse.success(res, 'Category retrieved', { category });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async create(req, res) {
    try {
      const category = await shopCategoryService.createCategory(req.body);
      return apiResponse.success(res, 'Category created', { category }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const category = await shopCategoryService.updateCategory(parseInt(req.params.id), req.body);
      return apiResponse.success(res, 'Category updated', { category });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const result = await shopCategoryService.deleteCategory(parseInt(req.params.id));
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async getCategoryProducts(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const categoryProducts = await shopCategoryService.getCategoryWithProducts(categoryId, { page, limit });
      return apiResponse.success(res, 'Category products retrieved', categoryProducts);
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getCategoryProductsBySlug(req, res) {
    try {
      const slug = req.params.slug;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const categoryProducts = await shopCategoryService.getCategoryProductsBySlug(slug, { page, limit });
      return apiResponse.success(res, 'Category products retrieved', categoryProducts);
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async seedData(req, res) {
    try {
      const results = await shopCategoryService.seedData();
      return apiResponse.success(res, `Seeded ${results.categories} categories and ${results.products} products`, results, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new ShopCategoryController();
