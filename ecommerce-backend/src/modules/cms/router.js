const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/home', controller.getHome);
router.get('/pages/:slug', controller.getPageBySlug);

module.exports = router;

