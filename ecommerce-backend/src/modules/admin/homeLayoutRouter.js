const express = require('express');
const router = express.Router();
const controller = require('./homeLayoutController');

router.get('/', controller.get);
router.post('/', controller.save);

module.exports = router;

