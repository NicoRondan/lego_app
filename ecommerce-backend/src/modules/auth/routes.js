const express = require('express');
const controller = require('./controller');
const { authMiddleware } = require('../../shared/middlewares');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);
router.get('/me', authMiddleware, controller.me);

router.get('/oauth/google/start', controller.oauthGoogleStart);
router.get('/oauth/google/callback', controller.oauthGoogleCallback);
router.get('/csrf', controller.csrfToken);

module.exports = router;
