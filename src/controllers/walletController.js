const walletService = require('../services/walletService');
const apiResponse = require('../utils/apiResponse');

class WalletController {

  // GET /api/wallet
  async getWallet(req, res) {
    try {
      const userId = req.user.id;
      const wallet = await walletService.getWallet(userId);
      return apiResponse.success(res, 'Wallet details fetched', wallet);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // POST /api/wallet/recharge
  async recharge(req, res) {
    try {
      const userId = req.user.id;
      const { amount, paymentMethod, referenceId } = req.body;

      if (!amount) {
        return apiResponse.error(res, 'Amount is required', 400);
      }

      const result = await walletService.rechargeWallet(
        userId,
        parseFloat(amount),
        paymentMethod || 'UPI',
        referenceId
      );
      return apiResponse.success(res, `Wallet recharged with ₹${amount}`, result, 201);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // GET /api/wallet/transactions
  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { page, limit, type, category, status } = req.query;
      const result = await walletService.getTransactionHistory(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        type,
        category,
        status
      });
      return apiResponse.success(res, 'Transaction history fetched', result);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // GET /api/wallet/balance
  async getBalance(req, res) {
    try {
      const userId = req.user.id;
      const wallet = await walletService.getWallet(userId);
      return apiResponse.success(res, 'Balance fetched', {
        balance: wallet.balance,
        currency: wallet.currency
      });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // GET /api/wallet/rates
  async getRates(req, res) {
    try {
      const rates = walletService.getRates();
      return apiResponse.success(res, 'Wallet rates fetched', rates);
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // GET /api/wallet/can-chat
  async canChat(req, res) {
    try {
      const userId = req.user.id;
      const canChat = await walletService.canChat(userId);
      const wallet = await walletService.getWallet(userId);
      return apiResponse.success(res, canChat ? 'Sufficient balance for chat' : 'Insufficient balance for chat', {
        canChat,
        balance: wallet.balance,
        requiredPerMessage: walletService.getRates().chatPerMessage,
        currency: wallet.currency
      });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // GET /api/wallet/can-call?type=voice
  async canCall(req, res) {
    try {
      const userId = req.user.id;
      const callType = req.query.type || 'voice';
      const canCall = await walletService.canCall(userId, callType);
      const wallet = await walletService.getWallet(userId);
      const rates = walletService.getRates();
      const ratePerMinute = callType === 'video' ? rates.videoCallPerMinute : rates.voiceCallPerMinute;

      return apiResponse.success(res, canCall ? 'Sufficient balance for call' : 'Insufficient balance for call', {
        canCall,
        callType,
        balance: wallet.balance,
        ratePerMinute,
        currency: wallet.currency
      });
    } catch (error) {
      return apiResponse.error(res, error.message);
    }
  }

  // POST /api/wallet/deduct/chat
  async deductForChat(req, res) {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return apiResponse.error(res, 'targetUserId is required', 400);
      }

      const result = await walletService.deductForChat(userId, parseInt(targetUserId));
      return apiResponse.success(res, 'Chat charge deducted', result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }

  // POST /api/wallet/deduct/call
  async deductForCall(req, res) {
    try {
      const userId = req.user.id;
      const { targetUserId, callType, durationMinutes } = req.body;

      if (!targetUserId || !callType || !durationMinutes) {
        return apiResponse.error(res, 'targetUserId, callType, and durationMinutes are required', 400);
      }

      if (!['voice', 'video'].includes(callType)) {
        return apiResponse.error(res, 'callType must be voice or video', 400);
      }

      let result;
      if (callType === 'video') {
        result = await walletService.deductForVideoCall(userId, parseInt(targetUserId), parseFloat(durationMinutes));
      } else {
        result = await walletService.deductForVoiceCall(userId, parseInt(targetUserId), parseFloat(durationMinutes));
      }

      return apiResponse.success(res, `${callType} call charge deducted`, result);
    } catch (error) {
      return apiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new WalletController();
