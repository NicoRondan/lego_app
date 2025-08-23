// src/modules/payments/controller.js
// Handles creation of Mercado Pago payment preferences and processing of
// payment notifications via webhook. This implementation is stubbed for
// educational purposes and does not interact with the real Mercado Pago API.

const { Order, Payment } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const crypto = require('crypto');

// POST /payments/mp/preference
exports.createPreference = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { orderId } = req.body;
    if (!orderId) throw new ApiError('orderId is required', 400);
    const order = await Order.findOne({ where: { id: orderId, userId: user.id } });
    if (!order) throw new ApiError('Order not found', 404);
    if (order.status !== 'pending') throw new ApiError('Order is not pending payment', 400);
    // Generate a mock preference ID and URL
    // Generate a pseudo-unique preference ID using random bytes
    const randomId = crypto.randomBytes(8).toString('hex');
    const preferenceId = `pref_${randomId}`;
    const initPoint = `https://fake.mercadopago.com/pay/${preferenceId}`;
    // Create a Payment record; externalId holds Mercado Pago payment/preference ID
    const payment = await Payment.create({ orderId: order.id, provider: 'mp', status: 'pending', amount: order.total, externalId: preferenceId });
    res.json({ preferenceId, initPoint, payment });
  } catch (err) {
    next(err);
  }
};

// POST /payments/mp/webhooks
// In a real integration Mercado Pago will POST an event when a payment status changes.
// The payload typically contains the payment id and other metadata. Here we accept
// a simplified payload { paymentId, status } for demonstration.
exports.handleWebhook = async (req, res, next) => {
  try {
    const { paymentId, status } = req.body;
    if (!paymentId || !status) throw new ApiError('paymentId and status are required', 400);
    // Locate the payment by externalId (Mercado Pago id)
    const payment = await Payment.findOne({ where: { externalId: paymentId } });
    if (!payment) throw new ApiError('Payment not found', 404);
    // Only update if status has changed
    if (payment.status === status) {
      return res.json({ message: 'No change' });
    }
    // Update payment status
    payment.status = status;
    await payment.save();
    // Update corresponding order
    const order = await Order.findByPk(payment.orderId);
    if (status === 'approved') {
      order.status = 'paid';
    } else if (status === 'rejected' || status === 'cancelled') {
      order.status = status;
    } else if (status === 'refunded') {
      order.status = 'refunded';
    }
    await order.save();
    res.json({ message: 'Webhook processed' });
  } catch (err) {
    next(err);
  }
};