// src/modules/admin/paymentsRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./paymentsController');

// GET /admin/payments/:idOrExtId
router.get('/:idOrExtId', controller.getPaymentAudit);

module.exports = router;

