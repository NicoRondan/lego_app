// src/modules/me/router.js
// Routes for current-user scoped resources (wishlist, etc.)

const express = require('express');
const router = express.Router();
const wishlist = require('./wishlistController');

// Wishlists collection
router.get('/wishlists', wishlist.listWishlists);
router.post('/wishlists', wishlist.createWishlist);
router.delete('/wishlists/:id', wishlist.deleteWishlist);

// Default wishlist helpers (singular path)
router.get('/wishlist', wishlist.getDefaultWishlist);

// Wishlist items (supports default or explicit wishlistId in body)
router.post('/wishlist/items', wishlist.addItem);
router.delete('/wishlist/items/:id', wishlist.removeItem);

module.exports = router;

