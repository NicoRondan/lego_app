// src/modules/payments/router.js
// Routes related to payments and Mercado Pago integration. All routes
// require authentication since they operate on user orders.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// POST /payments/mp/preference
router.post('/mp/preference', controller.createPreference);

// POST /payments/mp/webhooks
router.post('/mp/webhooks', controller.handleWebhook);

module.exports = router;