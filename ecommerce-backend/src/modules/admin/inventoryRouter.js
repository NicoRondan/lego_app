// src/modules/admin/inventoryRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./inventoryController');

router.get('/', controller.list);
router.patch('/:productId/adjust', controller.adjust);
router.put('/:productId/safety', controller.updateSafety);
router.get('/:productId/movements', controller.movements);

module.exports = router;

