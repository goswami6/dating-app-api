const { Wallet, WalletTransaction, User } = require('../models');

class WalletRepository {
  async findByUserId(userId) {
    return await Wallet.findOne({ where: { userId } });
  }

  async findById(id) {
    return await Wallet.findByPk(id);
  }

  async create(data) {
    return await Wallet.create(data);
  }

  async updateBalance(userId, newBalance) {
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return null;
    return await wallet.update({ balance: newBalance });
  }

  async findOrCreate(userId, currency = 'INR') {
    const [wallet] = await Wallet.findOrCreate({
      where: { userId },
      defaults: { userId, balance: 0, currency, isActive: true }
    });
    return wallet;
  }
}

module.exports = new WalletRepository();
