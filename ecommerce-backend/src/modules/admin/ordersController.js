// src/modules/admin/ordersController.js
const { Op } = require('sequelize');
const {
  sequelize,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Coupon,
  User,
  OrderStatusHistory,
} = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const { sendMail } = require('../../infra/mailer');

const STATUS = ['pending', 'paid', 'picking', 'shipped', 'delivered', 'canceled', 'refunded'];

function isValidAdminTransition(from, to) {
  if (to === 'paid') return false; // only via webhook/payment-capture
  if (to === 'refunded') return false; // use refund endpoint
  const map = {
    pending: ['canceled'],
    paid: ['picking', 'canceled'],
    picking: ['shipped', 'canceled'],
    shipped: ['delivered'],
    delivered: [],
    canceled: [],
    refunded: [],
  };
  return (map[from] || []).includes(to);
}

// GET /admin/orders?status=&q=&from=&to=&page=&pageSize=&format=csv
exports.listOrders = async (req, res, next) => {
  try {
    const { status, q, from, to, page = 1, pageSize = 20, format } = req.query;
    const where = {};
    if (status && STATUS.includes(String(status))) where.status = String(status);
    if (from) where.createdAt = { [Op.gte]: new Date(from) };
    if (to) where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(to) };

    const include = [
      { model: User, attributes: ['id', 'email', 'name'] },
      { model: Payment, as: 'payment', attributes: ['id', 'provider', 'status', 'externalId', 'amount'] },
    ];

    const searchWhere = [];
    if (q) {
      const qStr = String(q).trim();
      const qNum = parseInt(qStr, 10);
      if (!Number.isNaN(qNum)) searchWhere.push({ id: qNum });
      searchWhere.push({ '$User.email$': { [Op.like]: `%${qStr}%` } });
      searchWhere.push({ '$payment.external_id$': { [Op.like]: `%${qStr}%` } });
    }

    const pageN = Math.max(1, parseInt(page, 10) || 1);
    const sizeN = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 20));
    const offset = (pageN - 1) * sizeN;

    const { rows, count } = await Order.findAndCountAll({
      where: searchWhere.length ? { [Op.and]: [where, { [Op.or]: searchWhere }] } : where,
      include,
      order: [['createdAt', 'DESC']],
      limit: sizeN,
      offset,
    });

    if (String(format).toLowerCase() === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
      const header = 'id,userEmail,status,createdAt,grandTotal,currency,paymentStatus,paymentId\n';
      const lines = rows.map((o) => [
        o.id,
        o.User?.email || '',
        o.status,
        o.createdAt?.toISOString?.() || '',
        o.grandTotal || o.total || '',
        o.currency || '',
        o.paymentStatus || '',
        o.paymentId || o.payment?.externalId || '',
      ].map((v) => `${v}`).join(','));
      return res.send(header + lines.join('\n'));
    }

    res.json({ data: rows, page: pageN, pageSize: sizeN, total: count });
  } catch (err) {
    next(err);
  }
};

// GET /admin/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment', include: [] },
        { model: Shipment, as: 'shipment' },
        { model: Coupon, as: 'coupon' },
        { model: OrderStatusHistory, as: 'statusHistory' },
        { model: User, attributes: ['id', 'email', 'name'] },
      ],
      order: [[{ model: OrderStatusHistory, as: 'statusHistory' }, 'created_at', 'ASC']],
    });
    if (!order) throw new ApiError('Order not found', 404);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PUT /admin/orders/:id/status body: { to, note }
exports.updateStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { to, note } = req.body || {};
    if (!to || !STATUS.includes(String(to))) throw new ApiError('Invalid status', 400);
    const order = await Order.findByPk(id, { transaction: t });
    if (!order) throw new ApiError('Order not found', 404);
    if (!isValidAdminTransition(order.status, to)) {
      throw new ApiError('Invalid transition', 422, 'INVALID_TRANSITION');
    }
    const from = order.status;
    order.status = to;
    await order.save({ transaction: t });
    await OrderStatusHistory.create({ orderId: order.id, from, to, changedBy: req.user?.id || null, note }, { transaction: t });
    await t.commit();
    const full = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
        { model: Shipment, as: 'shipment' },
        { model: OrderStatusHistory, as: 'statusHistory' },
      ],
    });
    res.json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// POST /admin/orders/:id/ship body: { carrier, tracking, eta }
exports.markShipped = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { carrier, tracking } = req.body || {};
    const order = await Order.findByPk(id, { include: [{ model: Shipment, as: 'shipment' }, User], transaction: t });
    if (!order) throw new ApiError('Order not found', 404);
    if (!['picking', 'paid'].includes(order.status)) {
      throw new ApiError('Invalid transition', 422, 'INVALID_TRANSITION');
    }
    // Update shipment
    if (order.shipment) {
      order.shipment.carrier = carrier || order.shipment.carrier;
      order.shipment.tracking = tracking || order.shipment.tracking;
      order.shipment.status = 'shipped';
      await order.shipment.save({ transaction: t });
    } else {
      await Shipment.create({ orderId: order.id, carrier: carrier || null, tracking: tracking || null, status: 'shipped' }, { transaction: t });
    }
    const from = order.status;
    order.status = 'shipped';
    await order.save({ transaction: t });
    await OrderStatusHistory.create({ orderId: order.id, from, to: 'shipped', changedBy: req.user?.id || null, note: `Carrier: ${carrier || ''} Tracking: ${tracking || ''}` }, { transaction: t });
    await t.commit();

    // Send transactional email (best-effort)
    try {
      if (order.User?.email) await sendMail({ to: order.User.email, subject: `Tu pedido #${order.id} fue enviado`, text: `Tu pedido fue enviado por ${carrier || 'N/D'} con tracking ${tracking || 'N/D'}.` });
    } catch (_) {}

    const refreshed = await Order.findByPk(order.id, { include: ['shipment', 'statusHistory'] });
    res.json(refreshed);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// POST /admin/orders/:id/refund body: { amount, reason }
exports.refund = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { amount, reason } = req.body || {};
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt <= 0) throw new ApiError('Invalid amount', 400);
    const order = await Order.findByPk(id, { include: [{ model: Payment, as: 'payment' }, User], transaction: t });
    if (!order) throw new ApiError('Order not found', 404);
    if (!order.payment) throw new ApiError('Payment not found', 404);

    // Simulate refund; in real integration call provider API here
    order.payment.status = 'refunded';
    order.payment.rawPayload = { ...(order.payment.rawPayload || {}), refund: { amount: amt, reason: reason || '' } };
    await order.payment.save({ transaction: t });

    // Update order payment status
    order.paymentStatus = 'refunded';
    const prev = order.status;
    // Full refund -> move to refunded; partial -> keep status
    const total = parseFloat(order.grandTotal || order.total || 0);
    if (amt >= total - 1e-6) {
      order.status = 'refunded';
    }
    await order.save({ transaction: t });
    await OrderStatusHistory.create({ orderId: order.id, from: prev, to: order.status, changedBy: req.user?.id || null, note: `Refund ${amt} ${order.currency || ''} - ${reason || ''}` }, { transaction: t });
    await t.commit();

    // Email notification
    try {
      if (order.User?.email) await sendMail({ to: order.User.email, subject: `Reembolso de pedido #${order.id}`, text: `Se realizó un reembolso de ${amt} ${order.currency || ''}.` });
    } catch (_) {}

    const refreshed = await Order.findByPk(order.id, { include: ['payment', 'statusHistory'] });
    res.json(refreshed);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

