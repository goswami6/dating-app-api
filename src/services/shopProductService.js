const shopProductRepository = require('../repositories/shopProductRepository');

class ShopProductService {
  async createProduct(data) {
    data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    return await shopProductRepository.create(data);
  }

  async getProducts(filters) {
    const result = await shopProductRepository.findAll(filters);
    return {
      products: result.rows,
      total: result.count,
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 20,
    };
  }

  async getProductById(id) {
    const product = await shopProductRepository.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async getProductBySlug(slug) {
    const product = await shopProductRepository.findBySlug(slug);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async updateProduct(id, data) {
    const product = await shopProductRepository.update(id, data);
    if (!product) throw new Error('Product not found');
    return product;
  }

  async deleteProduct(id) {
    const result = await shopProductRepository.delete(id);
    if (!result) throw new Error('Product not found');
    return { message: 'Product deleted' };
  }

  async getFeaturedProducts(limit) {
    return await shopProductRepository.findFeatured(limit);
  }

  async getProductsByCategory(categoryId, options) {
    const result = await shopProductRepository.findByCategory(categoryId, options);
    return {
      products: result.rows,
      total: result.count,
      page: parseInt(options.page) || 1,
      limit: parseInt(options.limit) || 20,
    };
  }
}

module.exports = new ShopProductService();
