// src/modules/catalog/categoriesRouter.js
// Simple router dedicated to categories, to avoid conflicting paths when
// mounting the catalog router under multiple base paths.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// GET /categories
router.get('/', controller.getCategories);

module.exports = router;