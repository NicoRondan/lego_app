// src/modules/cart/router.js
// Routes for managing the shopping cart. Requires authentication on
// all routes, as cart belongs to a user.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// GET /cart
router.get('/', controller.getCart);

// POST /cart/items
router.post('/items', controller.addItem);

// PATCH /cart/items/:id
router.patch('/items/:id', controller.updateItem);

// DELETE /cart/items/:id
router.delete('/items/:id', controller.removeItem);

module.exports = router;