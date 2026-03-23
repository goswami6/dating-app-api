const shopProductService = require('../services/shopProductService');
const apiResponse = require('../utils/apiResponse');

class ShopProductController {
  async getAll(req, res) {
    try {
      const { page, limit, categoryId, search, minPrice, maxPrice, isFeatured, sortBy } = req.query;
      const filters = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        search,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        isFeatured: isFeatured === 'true' ? true : undefined,
        sortBy
      };
      const result = await shopProductService.getProducts(filters);
      return apiResponse.success(res, 'Products retrieved', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getById(req, res) {
    try {
      const product = await shopProductService.getProductById(parseInt(req.params.id));
      return apiResponse.success(res, 'Product retrieved', { product });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getBySlug(req, res) {
    try {
      const product = await shopProductService.getProductBySlug(req.params.slug);
      return apiResponse.success(res, 'Product retrieved', { product });
    } catch (error) {
      return apiResponse.error(res, error.message, 404);
    }
  }

  async getFeatured(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const products = await shopProductService.getFeaturedProducts(limit);
      return apiResponse.success(res, 'Featured products retrieved', { products });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async getByCategory(req, res) {
    try {
      const { page, limit } = req.query;
      const products = await shopProductService.getProductsByCategory(
        parseInt(req.params.categoryId),
        { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
      );
      return apiResponse.success(res, 'Products retrieved', products);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  async create(req, res) {
    try {
      const product = await shopProductService.createProduct(req.body);
      return apiResponse.success(res, 'Product created', { product }, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const product = await shopProductService.updateProduct(parseInt(req.params.id), req.body);
      return apiResponse.success(res, 'Product updated', { product });
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const result = await shopProductService.deleteProduct(parseInt(req.params.id));
      return apiResponse.success(res, result.message);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new ShopProductController();
