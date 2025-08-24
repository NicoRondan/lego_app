// Router for external webhooks
const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../payments/controller');

// POST /webhooks/mp
router.post('/mp', handleWebhook);

module.exports = router;
