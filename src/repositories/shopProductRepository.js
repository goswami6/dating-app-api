const { Op } = require('sequelize');
const ShopProduct = require('../models/shopProductModel');
const ShopCategory = require('../models/shopCategoryModel');

class ShopProductRepository {
  async create(data) {
    return await ShopProduct.create(data);
  }

  async findAll({ page = 1, limit = 20, categoryId, search, minPrice, maxPrice, isFeatured, sortBy = 'createdAt', sortOrder = 'DESC' } = {}) {
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await ShopProduct.findAndCountAll({
      where,
      include: [{ model: ShopCategory, as: 'Category', attributes: ['id', 'name', 'slug'] }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });
  }

  async findById(id) {
    return await ShopProduct.findByPk(id, {
      include: [{ model: ShopCategory, as: 'Category', attributes: ['id', 'name', 'slug'] }],
    });
  }

  async findBySlug(slug) {
    return await ShopProduct.findOne({
      where: { slug },
      include: [{ model: ShopCategory, as: 'Category', attributes: ['id', 'name', 'slug'] }],
    });
  }

  async update(id, data) {
    const product = await ShopProduct.findByPk(id);
    if (!product) return null;
    return await product.update(data);
  }

  async delete(id) {
    const product = await ShopProduct.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return true;
  }

  async findByCategory(categoryId, { page = 1, limit = 20 } = {}) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return await ShopProduct.findAndCountAll({
      where: { categoryId, isActive: true },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });
  }

  async findFeatured(limit = 10) {
    return await ShopProduct.findAll({
      where: { isFeatured: true, isActive: true },
      include: [{ model: ShopCategory, as: 'Category', attributes: ['id', 'name', 'slug'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });
  }
}

module.exports = new ShopProductRepository();
