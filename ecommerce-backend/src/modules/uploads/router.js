const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireRole } = require('../../shared/middlewares');

router.post('/', requireRole('admin'), controller.uploadImage);

module.exports = router;
