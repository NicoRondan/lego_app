// src/modules/catalog/router.js
// Routes related to product catalog and categories. Provides endpoints
// for listing products with optional filters and retrieving individual
// products or categories. These routes are unauthenticated.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// GET /products?search=&theme=&minPrice=&maxPrice=
router.get('/', controller.getProducts);

// GET /products/:id
router.get('/:id', controller.getProductById);

// GET /categories (aliased to /categories path in server.js)
router.get('/categories', controller.getCategories);

module.exports = router;