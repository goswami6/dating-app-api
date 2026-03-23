const shopOrderRepository = require('../repositories/shopOrderRepository');
const shopCartRepository = require('../repositories/shopCartRepository');
const shopAddressRepository = require('../repositories/shopAddressRepository');
const ShopProduct = require('../models/shopProductModel');

class ShopOrderService {
  _generateOrderNumber() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${ts}-${rand}`;
  }

  async placeOrder(userId, { addressId, paymentMethod = 'cod', couponCode, notes }) {
    // Validate address
    const address = await shopAddressRepository.findById(addressId, userId);
    if (!address) throw new Error('Address not found');

    // Get cart items
    const cartItems = await shopCartRepository.findByUser(userId);
    if (!cartItems.length) throw new Error('Cart is empty');

    // Validate stock and build order items
    let subtotal = 0;
    const orderItems = [];
    for (const item of cartItems) {
      const product = await ShopProduct.findByPk(item.productId);
      if (!product || !product.isActive) throw new Error(`Product "${item.Product?.name || item.productId}" is unavailable`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for "${product.name}"`);

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.thumbnail,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        selectedAttributes: item.selectedAttributes,
      });
    }

    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const totalAmount = Math.round((subtotal + shippingCharge + tax) * 100) / 100;

    // Create order
    const order = await shopOrderRepository.create({
      orderNumber: this._generateOrderNumber(),
      userId,
      addressId,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      subtotal,
      shippingCharge,
      tax,
      discount: 0,
      totalAmount,
      couponCode,
      notes,
      status: 'pending',
    }, orderItems);

    // Deduct stock
    for (const item of orderItems) {
      await ShopProduct.decrement('stock', { by: item.quantity, where: { id: item.productId } });
    }

    // Clear cart
    await shopCartRepository.clearCart(userId);

    return order;
  }

  async getOrders(userId, page = 1, limit = 10, status) {
    const options = { page, limit, status };
    const result = await shopOrderRepository.findByUser(userId, options);
    return {
      orders: result.rows,
      total: result.count,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    };
  }

  async getOrderById(userId, orderId) {
    const order = await shopOrderRepository.findById(orderId);
    if (!order || order.userId !== userId) throw new Error('Order not found');
    return order;
  }

  async getOrderByNumber(userId, orderNumber) {
    const order = await shopOrderRepository.findByOrderNumber(orderNumber);
    if (!order || order.userId !== userId) throw new Error('Order not found');
    return order;
  }

  async cancelOrder(userId, orderId, reason) {
    const order = await shopOrderRepository.findById(orderId);
    if (!order || order.userId !== userId) throw new Error('Order not found');
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore stock
    const items = await order.getItems();
    for (const item of items) {
      await ShopProduct.increment('stock', { by: item.quantity, where: { id: item.productId } });
    }

    return await shopOrderRepository.updateStatus(orderId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
    });
  }
}

module.exports = new ShopOrderService();
