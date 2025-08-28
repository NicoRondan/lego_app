const express = require('express');
const controller = require('./reportsController');

const router = express.Router();

// Sales summary by period
// GET /admin/reports/sales/summary?from=&to=&groupBy=day|week|month&status=paid,shipped,delivered&format=csv
router.get('/sales/summary', controller.salesSummary);

// Sales by theme (category)
// GET /admin/reports/sales/by-theme?from=&to=&status=...&format=csv
router.get('/sales/by-theme', controller.salesByTheme);

// Top products by qty/net
// GET /admin/reports/sales/top-products?from=&to=&limit=10&status=...&format=csv
router.get('/sales/top-products', controller.topProducts);

// Low stock report
// GET /admin/reports/stock/low?threshold=5&format=csv
router.get('/stock/low', controller.lowStock);

module.exports = router;

