// src/modules/orders/controller.js
// Controller functions for orders. Provides endpoints for listing a user's
// orders, fetching a specific order by ID and creating a new order from
// the current cart. All routes require authentication.

const { Cart, CartItem, Order, OrderItem, Product, Payment, Shipment, Coupon, IdempotencyKey } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const sequelize = require('../../infra/models').sequelize;

// GET /orders
exports.getOrders = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const orders = await Order.findAll({
      where: { userId: user.id },
      include: [
        { model: OrderItem, as: 'items', include: [Product] },
        { model: Payment, as: 'payment' },
        { model: Shipment, as: 'shipment' },
        { model: Coupon, as: 'coupon' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { id } = req.params;
    const order = await Order.findOne({
      where: { id, userId: user.id },
      include: [
        { model: OrderItem, as: 'items', include: [Product] },
        { model: Payment, as: 'payment' },
        { model: Shipment, as: 'shipment' },
        { model: Coupon, as: 'coupon' },
      ],
    });
    if (!order) throw new ApiError('Order not found', 404);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// POST /orders
exports.createOrder = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const idempotencyKey = req.get('Idempotency-Key');
    if (idempotencyKey) {
      const existingKey = await IdempotencyKey.findOne({
        where: { key: idempotencyKey, endpoint: 'POST /orders', userId: user.id },
      });
      if (existingKey) {
        const existingOrder = await Order.findByPk(existingKey.refId, {
          include: [
            { model: OrderItem, as: 'items', include: [Product] },
            { model: Payment, as: 'payment' },
            { model: Shipment, as: 'shipment' },
            { model: Coupon, as: 'coupon' },
          ],
        });
        if (existingOrder) return res.json(existingOrder);
      }
    }
    const dto = require('./dto');
    const { couponCode } = dto.parseCreateOrder(req.body);
    const cart = await Cart.findOne({
      where: { userId: user.id },
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    if (!cart || cart.items.length === 0) throw new ApiError('Cart is empty', 400);
    const order = await sequelize.transaction(async (t) => {
      let coupon = null;
      if (couponCode) {
        coupon = await Coupon.findOne({ where: { code: couponCode }, transaction: t });
      }
      const total = cart.items.reduce((sum, ci) => sum + ci.quantity * ci.unitPrice, 0);
      const orderRecord = await Order.create(
        { userId: user.id, status: 'pending', total, couponId: coupon ? coupon.id : null },
        { transaction: t }
      );
      for (const ci of cart.items) {
        await OrderItem.create(
          { orderId: orderRecord.id, productId: ci.productId, quantity: ci.quantity, unitPrice: ci.unitPrice, subtotal: ci.quantity * ci.unitPrice },
          { transaction: t }
        );
      }
      await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
      return orderRecord;
    });
    if (idempotencyKey) {
      await IdempotencyKey.create({
        key: idempotencyKey,
        endpoint: 'POST /orders',
        refId: order.id,
        userId: user.id,
      });
    }
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [Product] },
        { model: Payment, as: 'payment' },
        { model: Shipment, as: 'shipment' },
        { model: Coupon, as: 'coupon' },
      ],
    });
    res.json(fullOrder);
  } catch (err) {
    next(err);
  }
};