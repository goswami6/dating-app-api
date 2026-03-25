const { Op } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

const User = require('../models/userModel');
const Match = require('../models/matchModel');
const Booking = require('../models/bookingModel');
const Call = require('../models/callModel');
const Message = require('../models/messageModel');
const { ShopOrder } = require('../models/shopOrderModel');
const ShopProduct = require('../models/shopProductModel');
const ShopCategory = require('../models/shopCategoryModel');
const WalletTransaction = require('../models/walletTransactionModel');

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

      return apiResponse.success(res, 'Calls list', { calls: rows, total: count });
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
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return apiResponse.success(res, 'Orders list', { orders: rows, total: count });
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
}

module.exports = new AdminController();
