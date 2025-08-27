// src/modules/catalog/router.js
// Routes related to product catalog. Provides endpoints
// for listing products with optional filters and retrieving individual
// products. These routes are unauthenticated.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// GET /products?search=&theme=&minPrice=&maxPrice=&page=&limit=&order=
router.get('/', controller.getProducts);

// GET /products/:idOrSlug
router.get('/:idOrSlug', controller.getProductById);

module.exports = router;
