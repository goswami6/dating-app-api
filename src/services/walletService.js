const { sequelize } = require('../models');
const walletRepository = require('../repositories/walletRepository');
const walletTransactionRepository = require('../repositories/walletTransactionRepository');

// ── Rate Configuration (INR per minute) ─────────────────
const RATES = {
  chat: 2,          // ₹2 per chat session
  voice_call: 5,    // ₹5 per minute
  video_call: 10,   // ₹10 per minute
};

const RECHARGE_AMOUNTS = [5, 20, 50, 100, 200, 500];

class WalletService {

  // ── Get or Create Wallet ────────────────────────────────
  async getWallet(userId) {
    const wallet = await walletRepository.findOrCreate(userId);
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };
  }

  // ── Recharge Wallet ─────────────────────────────────────
  async rechargeWallet(userId, amount, paymentMethod = 'UPI', referenceId = null) {
    if (!RECHARGE_AMOUNTS.includes(amount)) {
      throw new Error(`Invalid recharge amount. Allowed amounts: ${RECHARGE_AMOUNTS.join(', ')}`);
    }

    const t = await sequelize.transaction();
    try {
      const wallet = await walletRepository.findOrCreate(userId);
      const newBalance = parseFloat(wallet.balance) + amount;

      await walletRepository.updateBalance(userId, newBalance);

      const transaction = await walletTransactionRepository.create({
        walletId: wallet.id,
        userId,
        amount,
        type: 'credit',
        category: 'recharge',
        status: 'success',
        paymentMethod,
        referenceId,
        description: `Wallet recharge of ₹${amount} via ${paymentMethod}`,
        balanceAfter: newBalance,
        metadata: { paymentMethod, rechargeAmount: amount }
      });

      await t.commit();
      return {
        wallet: { id: wallet.id, balance: newBalance, currency: wallet.currency },
        transaction: {
          id: transaction.id,
          amount: parseFloat(transaction.amount),
          type: transaction.type,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod,
          description: transaction.description,
          balanceAfter: newBalance,
          createdAt: transaction.createdAt
        }
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // ── Deduct for Chat Session ──────────────────────────────
  async deductForChatSession(userId, targetUserId) {
    const rate = RATES.chat;
    return await this._deductBalance(userId, rate, 'chat', `Chat session with user #${targetUserId}`, {
      targetUserId,
      ratePerSession: rate
    });
  }

  // ── Deduct for Voice Call (per minute) ──────────────────
  async deductForVoiceCall(userId, targetUserId, durationMinutes) {
    const rate = RATES.voice_call;
    const amount = rate * Math.ceil(durationMinutes);
    return await this._deductBalance(userId, amount, 'voice_call', `Voice call with user #${targetUserId} (${Math.ceil(durationMinutes)} min)`, {
      targetUserId,
      durationMinutes: Math.ceil(durationMinutes),
      ratePerMinute: rate
    });
  }

  // ── Deduct for Video Call (per minute) ──────────────────
  async deductForVideoCall(userId, targetUserId, durationMinutes) {
    const rate = RATES.video_call;
    const amount = rate * Math.ceil(durationMinutes);
    return await this._deductBalance(userId, amount, 'video_call', `Video call with user #${targetUserId} (${Math.ceil(durationMinutes)} min)`, {
      targetUserId,
      durationMinutes: Math.ceil(durationMinutes),
      ratePerMinute: rate
    });
  }

  // ── Check Balance Sufficient ────────────────────────────
  async hasBalance(userId, requiredAmount) {
    const wallet = await walletRepository.findOrCreate(userId);
    return parseFloat(wallet.balance) >= requiredAmount;
  }

  // ── Check if user can chat ──────────────────────────────
  async canChat(userId) {
    return await this.hasBalance(userId, RATES.chat);
  }

  // ── Check if user can call ──────────────────────────────
  async canCall(userId, callType = 'voice') {
    const rate = callType === 'video' ? RATES.video_call : RATES.voice_call;
    return await this.hasBalance(userId, rate);
  }

  // ── Get Transaction History ─────────────────────────────
  async getTransactionHistory(userId, options = {}) {
    return await walletTransactionRepository.findByUserId(userId, options);
  }

  // ── Get Rates ───────────────────────────────────────────
  getRates() {
    return {
      chatPerSession: RATES.chat,
      voiceCallPerMinute: RATES.voice_call,
      videoCallPerMinute: RATES.video_call,
      currency: 'INR',
      rechargeAmounts: RECHARGE_AMOUNTS
    };
  }

  // ── Private: Deduct Balance ─────────────────────────────
  async _deductBalance(userId, amount, category, description, metadata = {}) {
    const t = await sequelize.transaction();
    try {
      const wallet = await walletRepository.findOrCreate(userId);
      const currentBalance = parseFloat(wallet.balance);

      if (currentBalance < amount) {
        await t.rollback();
        throw new Error(`Insufficient wallet balance. Required: ₹${amount}, Available: ₹${currentBalance}`);
      }

      const newBalance = currentBalance - amount;
      await walletRepository.updateBalance(userId, newBalance);

      const transaction = await walletTransactionRepository.create({
        walletId: wallet.id,
        userId,
        amount,
        type: 'debit',
        category,
        status: 'success',
        description,
        balanceAfter: newBalance,
        metadata
      });

      await t.commit();
      return {
        wallet: { id: wallet.id, balance: newBalance, currency: wallet.currency },
        transaction: {
          id: transaction.id,
          amount: parseFloat(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          balanceAfter: newBalance,
          createdAt: transaction.createdAt
        }
      };
    } catch (error) {
      if (!t.finished) await t.rollback();
      throw error;
    }
  }
}

module.exports = new WalletService();
