const axios = require('axios');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { PaymentGatewayConfig, PaymentOrder, User, WalletTransaction } = require('../models');
const walletService = require('./walletService');

const GATEWAYS = {
  razorpay: {
    displayName: 'Razorpay',
    requiredConfig: ['keyId', 'keySecret'],
    defaults: {
      keyId: '',
      keySecret: '',
      webhookSecret: ''
    }
  },
  payu: {
    displayName: 'PayU',
    requiredConfig: ['merchantId', 'salt'],
    defaults: {
      merchantId: '',
      salt: '',
      paymentUrl: ''
    }
  }
};

class PaymentService {
  async ensureDefaultGatewayConfigs() {
    for (const gateway of Object.keys(GATEWAYS)) {
      const meta = GATEWAYS[gateway];
      await PaymentGatewayConfig.findOrCreate({
        where: { gateway },
        defaults: {
          gateway,
          displayName: meta.displayName,
          isEnabled: false,
          isSandbox: true,
          config: meta.defaults
        }
      });
    }
  }

  async listGatewayConfigsForAdmin() {
    await this.ensureDefaultGatewayConfigs();

    const rows = await PaymentGatewayConfig.findAll({
      order: [['gateway', 'ASC']]
    });

    return rows.map((row) => this._formatGatewayConfig(row));
  }

  async updateGatewayConfig(gateway, updates, adminUserId) {
    const gatewayKey = this._normalizeGateway(gateway);
    this._assertGatewaySupported(gatewayKey);

    await this.ensureDefaultGatewayConfigs();

    const row = await PaymentGatewayConfig.findOne({ where: { gateway: gatewayKey } });
    if (!row) throw new Error('Payment gateway config not found');

    const nextConfig = {
      ...(row.config || {}),
      ...(updates.config || {})
    };

    await row.update({
      displayName: updates.displayName !== undefined ? updates.displayName : row.displayName,
      isEnabled: updates.isEnabled !== undefined ? !!updates.isEnabled : row.isEnabled,
      isSandbox: updates.isSandbox !== undefined ? !!updates.isSandbox : row.isSandbox,
      config: nextConfig,
      updatedBy: adminUserId || null
    });

    return this._formatGatewayConfig(row);
  }

  async getPublicGatewayStatus() {
    await this.ensureDefaultGatewayConfigs();

    const rows = await PaymentGatewayConfig.findAll({ order: [['gateway', 'ASC']] });
    return rows.map((row) => ({
      gateway: row.gateway,
      displayName: row.displayName,
      isEnabled: !!row.isEnabled,
      isSandbox: !!row.isSandbox
    }));
  }

  async createPaymentOrder({ userId, gateway, amount, purpose = 'wallet_recharge', metadata = {} }) {
    const gatewayKey = this._normalizeGateway(gateway);
    this._assertGatewaySupported(gatewayKey);

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      throw new Error('Amount must be a valid positive number');
    }

    if (purpose === 'wallet_recharge') {
      const allowed = walletService.getRates().rechargeAmounts;
      if (!allowed.includes(amountValue)) {
        throw new Error(`Invalid recharge amount. Allowed amounts: ${allowed.join(', ')}`);
      }
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    if (!user) throw new Error('User not found');

    const gatewayRow = await this._getActiveGateway(gatewayKey);

    const order = await PaymentOrder.create({
      userId,
      gateway: gatewayKey,
      purpose,
      amount: amountValue,
      currency: 'INR',
      status: 'created',
      metadata: {
        ...metadata,
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
        email: user.email || '',
        createdVia: 'api'
      }
    });

    if (gatewayKey === 'razorpay') {
      return await this._createRazorpayOrder(order, gatewayRow);
    }

    return await this._createPayUOrder(order, gatewayRow);
  }

  async verifyRazorpayOrder({ paymentOrderId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('razorpayOrderId, razorpayPaymentId and razorpaySignature are required');
    }

    const order = await PaymentOrder.findOne({
      where: { id: paymentOrderId, userId, gateway: 'razorpay' }
    });
    if (!order) throw new Error('Payment order not found');

    if (order.status === 'success') {
      return await this._buildOrderWithWallet(order.id);
    }

    if (order.status === 'cancelled') {
      throw new Error('Payment order is already cancelled');
    }

    if (order.providerOrderId !== razorpayOrderId) {
      await order.update({ status: 'failed', failureReason: 'Provider order ID mismatch' });
      throw new Error('Invalid Razorpay order id');
    }

    const gatewayRow = await this._getActiveGateway('razorpay');
    const expectedSignature = crypto
      .createHmac('sha256', gatewayRow.config.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await order.update({ status: 'failed', failureReason: 'Signature verification failed' });
      throw new Error('Razorpay signature verification failed');
    }

    const walletTransactionId = await this._creditWalletIfNeeded(order, 'RAZORPAY', razorpayPaymentId);

    await order.update({
      status: 'success',
      providerPaymentId: razorpayPaymentId,
      providerSignature: razorpaySignature,
      walletTransactionId,
      paidAt: new Date(),
      failureReason: null
    });

    return await this._buildOrderWithWallet(order.id);
  }

  async verifyPayUOrder({ paymentOrderId, userId, status, txnid, mihpayid, hash, paymentMode, errorMessage }) {
    if (!status || !txnid || !hash) {
      throw new Error('status, txnid and hash are required');
    }

    const order = await PaymentOrder.findOne({
      where: { id: paymentOrderId, userId, gateway: 'payu' }
    });
    if (!order) throw new Error('Payment order not found');

    if (order.status === 'success') {
      return await this._buildOrderWithWallet(order.id);
    }

    if (order.providerOrderId !== txnid) {
      await order.update({ status: 'failed', failureReason: 'Provider transaction ID mismatch' });
      throw new Error('Invalid PayU transaction id');
    }

    const gatewayRow = await this._getActiveGateway('payu');
    const amount = Number(order.amount).toFixed(2);
    const firstName = order.metadata?.firstName || 'User';
    const email = order.metadata?.email || '';
    const productInfo = order.metadata?.productInfo || 'Wallet Recharge';

    const hashString = `${gatewayRow.config.salt}|${status}|||||||||||${email}|${firstName}|${productInfo}|${amount}|${txnid}|${gatewayRow.config.merchantId}`;
    const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex').toLowerCase();

    if ((hash || '').toLowerCase() !== expectedHash) {
      await order.update({ status: 'failed', failureReason: 'Hash verification failed' });
      throw new Error('PayU hash verification failed');
    }

    if ((status || '').toLowerCase() !== 'success') {
      await order.update({
        status: 'failed',
        providerTxnId: mihpayid || null,
        failureReason: errorMessage || `PayU payment status: ${status}`,
        metadata: {
          ...(order.metadata || {}),
          paymentMode: paymentMode || null
        }
      });
      throw new Error(errorMessage || 'PayU payment failed');
    }

    const walletTransactionId = await this._creditWalletIfNeeded(order, 'PAYU', mihpayid || txnid);

    await order.update({
      status: 'success',
      providerPaymentId: mihpayid || txnid,
      providerTxnId: txnid,
      walletTransactionId,
      paidAt: new Date(),
      failureReason: null,
      metadata: {
        ...(order.metadata || {}),
        paymentMode: paymentMode || null
      }
    });

    return await this._buildOrderWithWallet(order.id);
  }

  async getMyPaymentOrders(userId, options = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 20;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (options.gateway) where.gateway = this._normalizeGateway(options.gateway);
    if (options.status) where.status = options.status;

    const { rows, count } = await PaymentOrder.findAndCountAll({
      where,
      include: [{ model: WalletTransaction, as: 'WalletTransaction' }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getAdminPaymentOrders(options = {}) {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (options.gateway) where.gateway = this._normalizeGateway(options.gateway);
    if (options.status) where.status = options.status;
    if (options.purpose) where.purpose = options.purpose;

    if (options.search) {
      const query = `%${options.search}%`;
      where[Op.or] = [
        { providerOrderId: { [Op.like]: query } },
        { providerPaymentId: { [Op.like]: query } },
        { providerTxnId: { [Op.like]: query } }
      ];
    }

    const { rows, count } = await PaymentOrder.findAndCountAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: WalletTransaction, as: 'WalletTransaction' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  async adminUpdatePaymentOrderStatus(orderId, status, failureReason = null) {
    const allowed = ['created', 'pending', 'success', 'failed', 'cancelled'];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    }

    const order = await PaymentOrder.findByPk(orderId);
    if (!order) throw new Error('Payment order not found');

    const updates = {
      status,
      failureReason: status === 'failed' ? (failureReason || 'Marked failed by admin') : null
    };

    if (status === 'success' && !order.paidAt) {
      updates.paidAt = new Date();
      const walletTransactionId = await this._creditWalletIfNeeded(order, 'ADMIN', `ADMIN_ORDER_${order.id}`);
      if (walletTransactionId) {
        updates.walletTransactionId = walletTransactionId;
      }
    }

    await order.update(updates);

    return await this._buildOrderWithWallet(order.id);
  }

  async _createRazorpayOrder(order, gatewayRow) {
    const amountInPaise = Math.round(Number(order.amount) * 100);
    const payload = {
      amount: amountInPaise,
      currency: order.currency,
      receipt: `order_${order.id}`,
      notes: {
        paymentOrderId: String(order.id),
        userId: String(order.userId),
        purpose: order.purpose
      }
    };

    const response = await axios.post('https://api.razorpay.com/v1/orders', payload, {
      auth: {
        username: gatewayRow.config.keyId,
        password: gatewayRow.config.keySecret
      },
      timeout: 15000
    });

    await order.update({
      providerOrderId: response.data.id,
      status: 'pending',
      metadata: {
        ...(order.metadata || {}),
        receipt: payload.receipt,
        provider: {
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status
        }
      }
    });

    return {
      orderId: order.id,
      gateway: order.gateway,
      amount: Number(order.amount),
      currency: order.currency,
      status: 'pending',
      checkout: {
        type: 'razorpay',
        keyId: gatewayRow.config.keyId,
        razorpayOrderId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        name: gatewayRow.displayName
      }
    };
  }

  async _createPayUOrder(order, gatewayRow) {
    const amount = Number(order.amount).toFixed(2);
    const productInfo = order.metadata?.productInfo || 'Wallet Recharge';
    const firstName = order.metadata?.firstName || 'User';
    const email = order.metadata?.email || '';

    const txnid = `payu_${Date.now()}_${order.id}`;
    const hashString = `${gatewayRow.config.merchantId}|${txnid}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${gatewayRow.config.salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const paymentUrl = gatewayRow.config.paymentUrl || (gatewayRow.isSandbox
      ? 'https://test.payu.in/_payment'
      : 'https://secure.payu.in/_payment');

    await order.update({
      providerOrderId: txnid,
      status: 'pending',
      metadata: {
        ...(order.metadata || {}),
        productInfo,
        successUrl: gatewayRow.config.successUrl || '',
        failureUrl: gatewayRow.config.failureUrl || ''
      }
    });

    return {
      orderId: order.id,
      gateway: order.gateway,
      amount: Number(order.amount),
      currency: order.currency,
      status: 'pending',
      checkout: {
        type: 'payu',
        paymentUrl,
        formData: {
          key: gatewayRow.config.merchantId,
          txnid,
          amount,
          productinfo: productInfo,
          firstname: firstName,
          email,
          phone: order.metadata?.phone || '',
          surl: gatewayRow.config.successUrl || '',
          furl: gatewayRow.config.failureUrl || '',
          hash
        }
      }
    };
  }

  async _creditWalletIfNeeded(order, paymentMethod, referenceId) {
    if (order.purpose !== 'wallet_recharge') {
      return order.walletTransactionId || null;
    }

    if (order.walletTransactionId) {
      return order.walletTransactionId;
    }

    const recharge = await walletService.rechargeWallet(
      order.userId,
      Number(order.amount),
      paymentMethod,
      referenceId
    );

    return recharge?.transaction?.id || null;
  }

  async _getActiveGateway(gateway) {
    await this.ensureDefaultGatewayConfigs();

    const row = await PaymentGatewayConfig.findOne({ where: { gateway } });
    if (!row) throw new Error('Payment gateway config missing');
    if (!row.isEnabled) throw new Error(`${GATEWAYS[gateway].displayName} is currently disabled by admin`);

    const missing = (GATEWAYS[gateway].requiredConfig || []).filter((k) => !row.config?.[k]);
    if (missing.length) {
      throw new Error(`${GATEWAYS[gateway].displayName} config incomplete. Missing: ${missing.join(', ')}`);
    }

    return row;
  }

  _normalizeGateway(gateway) {
    return String(gateway || '').trim().toLowerCase();
  }

  _assertGatewaySupported(gateway) {
    if (!GATEWAYS[gateway]) {
      throw new Error('Unsupported gateway. Allowed: razorpay, payu');
    }
  }

  _formatGatewayConfig(row) {
    return {
      id: row.id,
      gateway: row.gateway,
      displayName: row.displayName,
      isEnabled: !!row.isEnabled,
      isSandbox: !!row.isSandbox,
      updatedBy: row.updatedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      config: row.config || {}
    };
  }

  async _buildOrderWithWallet(orderId) {
    const order = await PaymentOrder.findByPk(orderId, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: WalletTransaction, as: 'WalletTransaction' }
      ]
    });
    return order;
  }
}

module.exports = new PaymentService();
