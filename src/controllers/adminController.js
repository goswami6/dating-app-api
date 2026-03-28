const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

const User = require('../models/userModel');
const Match = require('../models/matchModel');
const Booking = require('../models/bookingModel');
const Call = require('../models/callModel');
const Message = require('../models/messageModel');
const { ShopOrder, ShopOrderItem } = require('../models/shopOrderModel');
const ShopProduct = require('../models/shopProductModel');
const ShopCategory = require('../models/shopCategoryModel');
const ShopAddress = require('../models/shopAddressModel');
const WalletTransaction = require('../models/walletTransactionModel');
const SubscriptionPlan = require('../models/subscriptionPlanModel');
const Subscription = require('../models/userSubscriptionModel');
const Badge = require('../models/badgeModel');
const UserBadge = require('../models/userBadgeModel');

class AdminController {

  // ─── Stats ──────────────────────────────────────────

  async statsUsers(req, res) {
    try {
      const [total, active, premium, online] = await Promise.all([
        User.count(),
        User.count({ where: { accountStatus: 'active' } }),
        User.count({ where: { isPremium: true } }),
        User.count({ where: { isOnline: true } }),
      ]);
      return apiResponse.success(res, 'User stats', { total, active, premium, online });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async statsMatches(req, res) {
    try {
      const [total, mutual] = await Promise.all([
        Match.count(),
        Match.count({ where: { status: 'mutual_match' } }),
      ]);
      return apiResponse.success(res, 'Match stats', { total, mutual });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async statsBookings(req, res) {
    try {
      const [total, pending, accepted] = await Promise.all([
        Booking.count(),
        Booking.count({ where: { status: 'pending' } }),
        Booking.count({ where: { status: 'accepted' } }),
      ]);
      return apiResponse.success(res, 'Booking stats', { total, pending, accepted });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async statsCalls(req, res) {
    try {
      const [total, ongoing] = await Promise.all([
        Call.count(),
        Call.count({ where: { status: 'ongoing' } }),
      ]);
      return apiResponse.success(res, 'Call stats', { total, ongoing });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async statsOrders(req, res) {
    try {
      const total = await ShopOrder.count();
      const revenueResult = await ShopOrder.sum('totalAmount', {
        where: { paymentStatus: 'paid' },
      });
      return apiResponse.success(res, 'Order stats', { total, revenue: revenueResult || 0 });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── List Endpoints ─────────────────────────────────

  async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['passwordHash', 'otp', 'otpExpiry'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Users list', { users: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getMatches(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { count, rows } = await Match.findAndCountAll({
        where,
        include: [
          { model: User, as: 'Initiator', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
          { model: User, as: 'MatchedUser', attributes: ['id', 'firstName', 'lastName', 'profilePicture'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Matches list', { matches: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getBookings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
          { model: User, as: 'Requester', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Bookings list', { bookings: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getCalls(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const callType = req.query.callType || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (callType) where.callType = callType;

      const CALL_RATES = { voice: 5, video: 10 };

      const { count, rows } = await Call.findAndCountAll({
        where,
        include: [
          { model: User, as: 'Caller', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const calls = rows.map(c => {
        const plain = c.toJSON();
        const durationMinutes = plain.duration ? Math.ceil(plain.duration / 60) : 0;
        const ratePerMinute = CALL_RATES[plain.callType] || 0;
        plain.walletCost = durationMinutes * ratePerMinute;
        plain.ratePerMinute = ratePerMinute;
        plain.durationMinutes = durationMinutes;
        plain.currency = 'INR';
        return plain;
      });

      return apiResponse.success(res, 'Calls list', { calls, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Message.findAndCountAll({
        include: [
          { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Messages list', { messages: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getShopProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await ShopProduct.findAndCountAll({
        include: [
          { model: ShopCategory, as: 'Category', attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Products list', { products: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getShopCategories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await ShopCategory.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Categories list', { categories: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getShopOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await ShopOrder.findAndCountAll({
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName'] },
          { model: ShopOrderItem, as: 'Items', attributes: ['id'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      return apiResponse.success(res, 'Orders list', { orders: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Product CRUD ───────────────────────────────────

  async createProduct(req, res) {
    try {
      const { categoryId, name, description, shortDescription, price, compareAtPrice, currency, images, thumbnail, sku, stock, isActive, isFeatured, tags, attributes, icon } = req.body;
      if (!categoryId || !name || !price) return apiResponse.error(res, 'categoryId, name and price are required', 400);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const product = await ShopProduct.create({
        categoryId, name, slug, description, shortDescription,
        price: parseFloat(price), compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        currency: currency || 'INR', images: images || [], thumbnail, sku,
        stock: parseInt(stock) || 0, isActive: isActive !== false,
        isFeatured: isFeatured === true, tags: tags || [], attributes: attributes || null, icon,
      });
      return apiResponse.success(res, 'Product created', product, 201);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Product with this name/sku already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await ShopProduct.findByPk(req.params.id);
      if (!product) return apiResponse.error(res, 'Product not found', 404);
      const { categoryId, name, description, shortDescription, price, compareAtPrice, currency, images, thumbnail, sku, stock, isActive, isFeatured, tags, attributes, icon } = req.body;
      const updates = {};
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (name !== undefined) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
      if (description !== undefined) updates.description = description;
      if (shortDescription !== undefined) updates.shortDescription = shortDescription;
      if (price !== undefined) updates.price = parseFloat(price);
      if (compareAtPrice !== undefined) updates.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
      if (currency !== undefined) updates.currency = currency;
      if (images !== undefined) updates.images = images;
      if (thumbnail !== undefined) updates.thumbnail = thumbnail;
      if (sku !== undefined) updates.sku = sku;
      if (stock !== undefined) updates.stock = parseInt(stock);
      if (isActive !== undefined) updates.isActive = isActive;
      if (isFeatured !== undefined) updates.isFeatured = isFeatured;
      if (tags !== undefined) updates.tags = tags;
      if (attributes !== undefined) updates.attributes = attributes;
      if (icon !== undefined) updates.icon = icon;
      await product.update(updates);
      return apiResponse.success(res, 'Product updated', product);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Product with this name/sku already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async deleteProduct(req, res) {
    try {
      const product = await ShopProduct.findByPk(req.params.id);
      if (!product) return apiResponse.error(res, 'Product not found', 404);
      await product.destroy();
      return apiResponse.success(res, 'Product deleted');
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Category CRUD ──────────────────────────────────

  async createCategory(req, res) {
    try {
      const { name, description, image, parentId, sortOrder, isActive } = req.body;
      if (!name) return apiResponse.error(res, 'Category name is required', 400);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const category = await ShopCategory.create({
        name, slug, description, image, parentId: parentId || null,
        sortOrder: parseInt(sortOrder) || 0, isActive: isActive !== false,
      });
      return apiResponse.success(res, 'Category created', category, 201);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Category name already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async updateCategory(req, res) {
    try {
      const category = await ShopCategory.findByPk(req.params.id);
      if (!category) return apiResponse.error(res, 'Category not found', 404);
      const { name, description, image, parentId, sortOrder, isActive } = req.body;
      const updates = {};
      if (name !== undefined) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
      if (description !== undefined) updates.description = description;
      if (image !== undefined) updates.image = image;
      if (parentId !== undefined) updates.parentId = parentId || null;
      if (sortOrder !== undefined) updates.sortOrder = parseInt(sortOrder);
      if (isActive !== undefined) updates.isActive = isActive;
      await category.update(updates);
      return apiResponse.success(res, 'Category updated', category);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Category name already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async deleteCategory(req, res) {
    try {
      const category = await ShopCategory.findByPk(req.params.id);
      if (!category) return apiResponse.error(res, 'Category not found', 404);
      const productCount = await ShopProduct.count({ where: { categoryId: category.id } });
      if (productCount > 0) return apiResponse.error(res, `Cannot delete — ${productCount} products belong to this category`, 400);
      await category.destroy();
      return apiResponse.success(res, 'Category deleted');
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Order Management ───────────────────────────────

  async getOrderDetail(req, res) {
    try {
      const order = await ShopOrder.findByPk(req.params.id, {
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: ShopAddress, as: 'Address' },
          { model: ShopOrderItem, as: 'Items', include: [{ model: ShopProduct, as: 'Product', attributes: ['id', 'name', 'icon', 'thumbnail'] }] },
        ],
      });
      if (!order) return apiResponse.error(res, 'Order not found', 404);
      return apiResponse.success(res, 'Order detail', order);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const order = await ShopOrder.findByPk(req.params.id);
      if (!order) return apiResponse.error(res, 'Order not found', 404);
      const { status, paymentStatus, cancelReason } = req.body;
      const updates = {};
      if (status) {
        updates.status = status;
        if (status === 'shipped') updates.shippedAt = new Date();
        if (status === 'delivered') updates.deliveredAt = new Date();
        if (status === 'cancelled') { updates.cancelledAt = new Date(); if (cancelReason) updates.cancelReason = cancelReason; }
      }
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      await order.update(updates);
      return apiResponse.success(res, 'Order updated', order);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async getWalletTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (type) where.category = type;

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where,
        include: [
          { model: User, attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Wallet transactions', { transactions: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Subscription Stats ─────────────────────────────

  async statsSubscriptions(req, res) {
    try {
      const [totalPlans, activePlans, totalSubscribers, activeSubscribers] = await Promise.all([
        SubscriptionPlan.count(),
        SubscriptionPlan.count({ where: { isActive: true } }),
        Subscription.count(),
        Subscription.count({ where: { status: 'active' } }),
      ]);
      const revenue = await Subscription.sum('id') ? await SubscriptionPlan.sum('price', {
        where: { id: { [Op.in]: (await Subscription.findAll({ where: { status: 'active' }, attributes: ['planId'], raw: true })).map(s => s.planId) } }
      }) : 0;
      return apiResponse.success(res, 'Subscription stats', { totalPlans, activePlans, totalSubscribers, activeSubscribers });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Subscription Plans CRUD ────────────────────────

  async getSubscriptionPlans(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await SubscriptionPlan.findAndCountAll({
        order: [['price', 'ASC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Subscription plans', { plans: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async createSubscriptionPlan(req, res) {
    try {
      const { name, tagline, duration, price, currency, features, isActive } = req.body;
      if (!name || !duration || !price) {
        return apiResponse.error(res, 'name, duration and price are required', 400);
      }
      const plan = await SubscriptionPlan.create({
        name, tagline, duration: parseInt(duration), price: parseFloat(price),
        currency: currency || 'INR', features: features || [], isActive: isActive !== false,
      });
      return apiResponse.success(res, 'Plan created', plan, 201);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return apiResponse.error(res, 'A plan with this name already exists', 409);
      }
      return apiResponse.error(res, err.message);
    }
  }

  async updateSubscriptionPlan(req, res) {
    try {
      const plan = await SubscriptionPlan.findByPk(req.params.id);
      if (!plan) return apiResponse.error(res, 'Plan not found', 404);

      const { name, tagline, duration, price, currency, features, isActive } = req.body;
      await plan.update({
        ...(name !== undefined && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currency !== undefined && { currency }),
        ...(features !== undefined && { features }),
        ...(isActive !== undefined && { isActive }),
      });

      return apiResponse.success(res, 'Plan updated', plan);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return apiResponse.error(res, 'A plan with this name already exists', 409);
      }
      return apiResponse.error(res, err.message);
    }
  }

  async deleteSubscriptionPlan(req, res) {
    try {
      const plan = await SubscriptionPlan.findByPk(req.params.id);
      if (!plan) return apiResponse.error(res, 'Plan not found', 404);
      await plan.destroy();
      return apiResponse.success(res, 'Plan deleted');
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── User Subscriptions List ────────────────────────

  async getSubscriptions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || '';
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;

      const { count, rows } = await Subscription.findAndCountAll({
        where,
        include: [
          { model: User, as: 'Subscriber', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: SubscriptionPlan, as: 'Plan', attributes: ['id', 'name', 'price', 'duration', 'currency'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Subscriptions list', { subscriptions: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Badge Stats ──────────────────────────────────

  async statsBadges(req, res) {
    try {
      const [totalBadges, totalAwarded, premiumBadges] = await Promise.all([
        Badge.count(),
        UserBadge.count(),
        Badge.count({ where: { isPremium: true } }),
      ]);
      return apiResponse.success(res, 'Badge stats', { totalBadges, totalAwarded, premiumBadges });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── Badges CRUD ────────────────────────────────────

  async getBadges(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Badge.findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });
      return apiResponse.success(res, 'Badges list', { badges: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async createBadge(req, res) {
    try {
      const { name, icon, description, requiredMonth, color, isPremium } = req.body;
      if (!name || !icon) return apiResponse.error(res, 'name and icon are required', 400);
      const badge = await Badge.create({
        name, icon, description: description || null,
        requiredMonth: parseInt(requiredMonth) || 0,
        color: color || '#FF4081', isPremium: isPremium === true,
      });
      return apiResponse.success(res, 'Badge created', badge, 201);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Badge name already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async updateBadge(req, res) {
    try {
      const badge = await Badge.findByPk(req.params.id);
      if (!badge) return apiResponse.error(res, 'Badge not found', 404);
      const { name, icon, description, requiredMonth, color, isPremium } = req.body;
      await badge.update({
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(description !== undefined && { description }),
        ...(requiredMonth !== undefined && { requiredMonth: parseInt(requiredMonth) }),
        ...(color !== undefined && { color }),
        ...(isPremium !== undefined && { isPremium }),
      });
      return apiResponse.success(res, 'Badge updated', badge);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') return apiResponse.error(res, 'Badge name already exists', 409);
      return apiResponse.error(res, err.message);
    }
  }

  async deleteBadge(req, res) {
    try {
      const badge = await Badge.findByPk(req.params.id);
      if (!badge) return apiResponse.error(res, 'Badge not found', 404);
      await UserBadge.destroy({ where: { badgeId: badge.id } });
      await badge.destroy();
      return apiResponse.success(res, 'Badge deleted');
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  // ─── User Badges (Award / Revoke) ───────────────────

  async getUserBadges(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const badgeId = req.query.badgeId || '';
      const search = req.query.search || '';

      const where = {};
      if (badgeId) where.badgeId = badgeId;

      const includeUser = { model: User, attributes: ['id', 'firstName', 'lastName', 'email'] };
      if (search) {
        includeUser.where = {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        };
      }

      const { count, rows } = await UserBadge.findAndCountAll({
        where,
        include: [
          includeUser,
          { model: Badge, as: 'Badge', attributes: ['id', 'name', 'icon', 'color'] },
        ],
        order: [['earnedAt', 'DESC']],
        limit,
        offset,
      });
      return apiResponse.success(res, 'User badges', { userBadges: rows, total: count });
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async awardBadge(req, res) {
    try {
      const { userId, badgeId } = req.body;
      if (!userId || !badgeId) return apiResponse.error(res, 'userId and badgeId are required', 400);
      const user = await User.findByPk(userId);
      if (!user) return apiResponse.error(res, 'User not found', 404);
      const badge = await Badge.findByPk(badgeId);
      if (!badge) return apiResponse.error(res, 'Badge not found', 404);
      const existing = await UserBadge.findOne({ where: { userId, badgeId } });
      if (existing) return apiResponse.error(res, 'User already has this badge', 409);
      const userBadge = await UserBadge.create({ userId, badgeId, earnedAt: new Date() });
      return apiResponse.success(res, 'Badge awarded', userBadge, 201);
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }

  async revokeBadge(req, res) {
    try {
      const { userId, badgeId } = req.params;
      const userBadge = await UserBadge.findOne({ where: { userId, badgeId } });
      if (!userBadge) return apiResponse.error(res, 'User badge not found', 404);
      await userBadge.destroy();
      return apiResponse.success(res, 'Badge revoked');
    } catch (err) {
      return apiResponse.error(res, err.message);
    }
  }
}

module.exports = new AdminController();
