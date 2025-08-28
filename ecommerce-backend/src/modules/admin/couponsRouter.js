const express = require('express');
const router = express.Router();
const controller = require('./couponsController');

// GET /admin/coupons
router.get('/', controller.listCoupons);

// POST /admin/coupons
router.post('/', controller.createCoupon);

// PUT /admin/coupons/:id
router.put('/:id', controller.updateCoupon);

// GET /admin/coupons/:id/usages
router.get('/:id/usages', controller.listCouponUsages);

module.exports = router;

