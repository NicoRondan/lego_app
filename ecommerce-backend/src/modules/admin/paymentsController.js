// src/modules/admin/paymentsController.js
const { Payment, PaymentEvent, Order } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// GET /admin/payments/:idOrExtId
exports.getPaymentAudit = async (req, res, next) => {
  try {
    const { idOrExtId } = req.params;
    let payment = null;
    const asNum = parseInt(idOrExtId, 10);
    if (!Number.isNaN(asNum)) {
      payment = await Payment.findByPk(asNum, { include: [{ model: PaymentEvent, as: 'events' }, { model: Order }] });
    }
    if (!payment) {
      payment = await Payment.findOne({ where: { externalId: idOrExtId }, include: [{ model: PaymentEvent, as: 'events' }, { model: Order }] });
    }
    if (!payment) throw new ApiError('Payment not found', 404);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

