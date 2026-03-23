const shopCategoryRepository = require('../repositories/shopCategoryRepository');
const shopProductRepository = require('../repositories/shopProductRepository');

const SEED_DATA = {
  "Men": {
    description: "Fashion & style essentials for men",
    image: "https://img.icons8.com/color/96/man.png",
    products: [
      { name: "Leather Jacket", price: 1499, icon: "🧥", description: "Premium leather jacket for a bold look", stock: 25, isFeatured: true, tags: ["jacket", "leather", "winter"] },
      { name: "Casual Shirt", price: 799, icon: "👕", description: "Comfortable casual shirt for everyday wear", stock: 50, tags: ["shirt", "casual"] },
      { name: "Denim Jeans", price: 1200, icon: "👖", description: "Classic denim jeans with perfect fit", stock: 40, tags: ["jeans", "denim"] },
      { name: "Sneakers", price: 2500, icon: "👟", description: "Trendy sneakers for comfort and style", stock: 30, isFeatured: true, tags: ["shoes", "sneakers", "sporty"] },
      { name: "Polo T-Shirt", price: 699, icon: "👕", description: "Classic polo t-shirt for a smart casual look", stock: 60, tags: ["tshirt", "polo", "casual"] },
      { name: "Men's Watch", price: 3500, icon: "⌚", description: "Elegant men's wristwatch", stock: 15, isFeatured: true, tags: ["watch", "accessory", "luxury"] },
      { name: "Leather Wallet", price: 499, icon: "👛", description: "Genuine leather wallet with card slots", stock: 45, tags: ["wallet", "leather", "accessory"] },
      { name: "Formal Shoes", price: 1800, icon: "👞", description: "Polished formal shoes for office and events", stock: 20, tags: ["shoes", "formal", "office"] }
    ]
  },
  "Women": {
    description: "Fashion & beauty essentials for women",
    image: "https://img.icons8.com/color/96/woman.png",
    products: [
      { name: "Floral Dress", price: 1800, icon: "👗", description: "Beautiful floral print dress for special occasions", stock: 30, isFeatured: true, tags: ["dress", "floral", "party"] },
      { name: "Handbag", price: 2200, icon: "👜", description: "Stylish designer handbag", stock: 20, isFeatured: true, tags: ["bag", "handbag", "fashion"] },
      { name: "Heels", price: 1500, icon: "👠", description: "Elegant high heels for a stunning look", stock: 25, tags: ["shoes", "heels", "party"] },
      { name: "Necklace", price: 999, icon: "📿", description: "Delicate necklace with pendant", stock: 35, tags: ["jewellery", "necklace"] },
      { name: "Designer Saree", price: 4500, icon: "👘", description: "Premium designer saree for festive occasions", stock: 15, isFeatured: true, tags: ["saree", "ethnic", "festive"] },
      { name: "Earrings Set", price: 299, icon: "👂", description: "Trendy earrings set of 6 pairs", stock: 50, tags: ["jewellery", "earrings"] },
      { name: "Makeup Kit", price: 1200, icon: "💄", description: "Complete makeup kit with essentials", stock: 30, tags: ["makeup", "beauty", "cosmetics"] },
      { name: "Sunglasses", price: 850, icon: "🕶️", description: "UV-protected fashionable sunglasses", stock: 40, tags: ["sunglasses", "accessory", "summer"] }
    ]
  },
  "Gifts": {
    description: "Perfect gifts for your loved ones",
    image: "https://img.icons8.com/color/96/gift.png",
    products: [
      { name: "Rose Bouquet", price: 350, icon: "🌹", description: "Fresh bouquet of 12 red roses", stock: 100, isFeatured: true, tags: ["roses", "flowers", "romantic"] },
      { name: "Chocolate Box", price: 500, icon: "🍫", description: "Premium assorted chocolate box", stock: 80, tags: ["chocolate", "sweets", "gift"] },
      { name: "Teddy Bear", price: 800, icon: "🧸", description: "Soft and cuddly teddy bear", stock: 60, isFeatured: true, tags: ["teddy", "soft-toy", "valentine"] },
      { name: "Gift Card", price: 1000, icon: "💳", description: "Universal gift card - let them choose!", stock: 200, tags: ["gift-card", "voucher"] },
      { name: "Coffee Mug", price: 250, icon: "☕", description: "Cute printed coffee mug", stock: 70, tags: ["mug", "coffee", "cute"] },
      { name: "Photo Frame", price: 450, icon: "🖼️", description: "Elegant photo frame for memories", stock: 45, tags: ["photo-frame", "memories", "decor"] },
      { name: "Birthday Card", price: 99, icon: "🎂", description: "Handmade birthday greeting card", stock: 150, tags: ["card", "birthday", "greeting"] },
      { name: "Perfume Set", price: 1500, icon: "💨", description: "Luxury perfume gift set", stock: 25, isFeatured: true, tags: ["perfume", "fragrance", "luxury"] }
    ]
  },
  "Accessories": {
    description: "Trendy accessories for everyone",
    image: "https://img.icons8.com/color/96/sunglasses.png",
    products: [
      { name: "Cool Sunglasses", price: 500, icon: "🕶️", description: "Stylish polarized sunglasses", stock: 55, tags: ["sunglasses", "cool", "summer"] },
      { name: "Smart Watch", price: 3500, icon: "⌚", description: "Feature-packed smart watch with fitness tracker", stock: 20, isFeatured: true, tags: ["smartwatch", "fitness", "tech"] },
      { name: "Leather Belt", price: 600, icon: "🏷️", description: "Genuine leather belt with buckle", stock: 40, tags: ["belt", "leather", "accessory"] },
      { name: "Compact Wallet", price: 450, icon: "👛", description: "Slim compact wallet for everyday use", stock: 50, tags: ["wallet", "compact", "slim"] },
      { name: "Baseball Cap", price: 350, icon: "🧢", description: "Trendy baseball cap", stock: 65, tags: ["cap", "hat", "sporty"] },
      { name: "Backpack", price: 1200, icon: "🎒", description: "Spacious and durable backpack", stock: 30, isFeatured: true, tags: ["backpack", "bag", "travel"] },
      { name: "Mini Umbrella", price: 400, icon: "🌂", description: "Compact foldable mini umbrella", stock: 45, tags: ["umbrella", "rain", "travel"] },
      { name: "Silk Scarf", price: 300, icon: "🧣", description: "Soft silk scarf in multiple colours", stock: 35, tags: ["scarf", "silk", "fashion"] }
    ]
  }
};

class ShopCategoryService {
  async createCategory(data) {
    data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return await shopCategoryRepository.create(data);
  }

  async getAllCategories(includeInactive) {
    return await shopCategoryRepository.findAll(includeInactive);
  }

  async getTopLevelCategories() {
    return await shopCategoryRepository.findTopLevel();
  }

  async getCategoryById(id) {
    const cat = await shopCategoryRepository.findById(id);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  async getCategoryBySlug(slug) {
    const cat = await shopCategoryRepository.findBySlug(slug);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  async updateCategory(id, data) {
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const cat = await shopCategoryRepository.update(id, data);
    if (!cat) throw new Error('Category not found');
    return cat;
  }

  async deleteCategory(id) {
    const result = await shopCategoryRepository.delete(id);
    if (!result) throw new Error('Category not found');
    return { message: 'Category deleted' };
  }

  async getCategoryWithProducts(categoryId, options = {}) {
    const category = await this.getCategoryById(categoryId);
    const productsResult = await shopProductRepository.findByCategory(categoryId, options);

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
      },
      products: productsResult.rows.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        icon: product.icon || '📦',
        description: product.shortDescription || product.description,
        image: product.images ? product.images[0] : null,
      })),
      pagination: {
        total: productsResult.count,
        page: options.page || 1,
        limit: options.limit || 20,
      }
    };
  }

  async getCategoryProductsBySlug(slug, options = {}) {
    const category = await this.getCategoryBySlug(slug);
    return this.getCategoryWithProducts(category.id, options);
  }

  async seedData() {
    const results = { categories: 0, products: 0 };

    for (const [categoryName, categoryData] of Object.entries(SEED_DATA)) {
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      let category;
      try {
        category = await shopCategoryRepository.findBySlug(slug);
      } catch (e) {
        category = null;
      }

      if (!category) {
        category = await shopCategoryRepository.create({
          name: categoryName,
          slug,
          description: categoryData.description,
          image: categoryData.image,
          sortOrder: results.categories,
          isActive: true,
        });
        results.categories++;
      }

      for (const product of categoryData.products) {
        const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        let existing;
        try {
          existing = await shopProductRepository.findBySlug(productSlug);
        } catch (e) {
          existing = null;
        }

        if (!existing) {
          await shopProductRepository.create({
            categoryId: category.id,
            name: product.name,
            slug: productSlug,
            description: product.description,
            shortDescription: product.description,
            price: product.price,
            compareAtPrice: Math.round(product.price * 1.3),
            currency: 'INR',
            icon: product.icon,
            stock: product.stock || 50,
            isActive: true,
            isFeatured: product.isFeatured || false,
            tags: product.tags || [],
            attributes: {},
            images: [],
          });
          results.products++;
        }
      }
    }

    return results;
  }
}

module.exports = new ShopCategoryService();
