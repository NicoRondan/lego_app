// src/modules/orders/router.js
// Routes for managing orders. Users can create orders from their cart
// and list or retrieve their existing orders. Authentication required.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// GET /orders
router.get('/', controller.getOrders);

// GET /orders/:id
router.get('/:id', controller.getOrderById);

// POST /orders
router.post('/', controller.createOrder);

module.exports = router;