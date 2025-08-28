// src/modules/admin/segmentsRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./segmentsController');

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;

