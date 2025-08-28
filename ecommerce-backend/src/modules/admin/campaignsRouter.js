// src/modules/admin/campaignsRouter.js
const express = require('express');
const router = express.Router();
const controller = require('./campaignsController');

router.get('/', controller.list);
router.post('/', controller.create);

module.exports = router;

