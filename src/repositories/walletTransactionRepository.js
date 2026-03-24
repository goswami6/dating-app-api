const { WalletTransaction } = require('../models');

class WalletTransactionRepository {
  async create(data) {
    return await WalletTransaction.create(data);
  }

  async findById(id) {
    return await WalletTransaction.findByPk(id);
  }

  async findByWalletId(walletId, options = {}) {
    const { page = 1, limit = 20, type, category, status } = options;
    const where = { walletId };

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await WalletTransaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async findByUserId(userId, options = {}) {
    const { page = 1, limit = 20, type, category, status } = options;
    const where = { userId };

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await WalletTransaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      transactions: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }

  async updateStatus(id, status) {
    const txn = await WalletTransaction.findByPk(id);
    if (!txn) return null;
    return await txn.update({ status });
  }
}

module.exports = new WalletTransactionRepository();
