// src/modules/wishlist/router.js
// Routes for managing the wishlist. Requires authentication on all routes.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/', controller.getWishlist);
router.post('/items', controller.addItem);
router.delete('/items/:id', controller.removeItem);

module.exports = router;
