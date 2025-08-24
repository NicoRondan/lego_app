const { ApiError } = require('../../shared/errors');

function parseCreatePreference(body) {
  const { orderId } = body;
  const id = parseInt(orderId, 10);
  if (isNaN(id)) throw new ApiError('orderId is required', 400);
  return { orderId: id };
}

function parseWebhook(body) {
  const { paymentId, status } = body;
  if (!paymentId || !status) throw new ApiError('paymentId and status are required', 400);
  return { paymentId: String(paymentId), status: String(status) };
}

module.exports = { parseCreatePreference, parseWebhook };
