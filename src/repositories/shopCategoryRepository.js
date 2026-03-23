const ShopCategory = require('../models/shopCategoryModel');
const ShopProduct = require('../models/shopProductModel');

class ShopCategoryRepository {
  async create(data) {
    return await ShopCategory.create(data);
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return await ShopCategory.findAll({
      where,
      include: [
        { model: ShopCategory, as: 'SubCategories', where: includeInactive ? undefined : { isActive: true }, required: false },
        { model: ShopProduct, as: 'Products', where: includeInactive ? undefined : { isActive: true }, required: false, attributes: ['id', 'name', 'slug', 'price', 'compareAtPrice', 'currency', 'icon', 'shortDescription', 'images', 'thumbnail', 'stock', 'isFeatured', 'tags', 'avgRating'] }
      ],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
  }

  async findById(id) {
    return await ShopCategory.findByPk(id, {
      include: [{ model: ShopCategory, as: 'SubCategories', required: false }],
    });
  }

  async findBySlug(slug) {
    return await ShopCategory.findOne({
      where: { slug },
      include: [{ model: ShopCategory, as: 'SubCategories', required: false }],
    });
  }

  async update(id, data) {
    const cat = await ShopCategory.findByPk(id);
    if (!cat) return null;
    return await cat.update(data);
  }

  async delete(id) {
    const cat = await ShopCategory.findByPk(id);
    if (!cat) return null;
    await cat.destroy();
    return true;
  }

  async findTopLevel() {
    return await ShopCategory.findAll({
      where: { parentId: null, isActive: true },
      include: [
        { model: ShopCategory, as: 'SubCategories', where: { isActive: true }, required: false },
        { model: ShopProduct, as: 'Products', where: { isActive: true }, required: false, attributes: ['id', 'name', 'slug', 'price', 'compareAtPrice', 'currency', 'icon', 'shortDescription', 'images', 'thumbnail', 'stock', 'isFeatured', 'tags', 'avgRating'] }
      ],
      order: [['sortOrder', 'ASC']],
    });
  }
}

module.exports = new ShopCategoryRepository();
