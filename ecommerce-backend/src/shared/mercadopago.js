// Helper to configure and export a Mercado Pago SDK instance
const mercadopago = require('mercadopago');
const { MP_ACCESS_TOKEN } = require('../config/env');

if (MP_ACCESS_TOKEN) {
  mercadopago.configure({ access_token: MP_ACCESS_TOKEN });
}

mercadopago.configured = Boolean(MP_ACCESS_TOKEN);

module.exports = mercadopago;
