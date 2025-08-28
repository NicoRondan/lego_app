// src/modules/admin/ordersRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./ordersController');

// GET /admin/orders
router.get('/', controller.listOrders);

// GET /admin/orders/:id
router.get('/:id', controller.getOrder);

// PUT /admin/orders/:id/status
router.put('/:id/status', controller.updateStatus);

// POST /admin/orders/:id/ship
router.post('/:id/ship', controller.markShipped);

// POST /admin/orders/:id/refund
router.post('/:id/refund', controller.refund);

module.exports = router;

