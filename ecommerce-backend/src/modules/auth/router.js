// src/modules/auth/router.js
// Routes for authentication. This module handles OAuth-based logins by
// accepting provider credentials and issuing JWTs. It does not implement
// the full OAuth redirect flow but provides a simplified API suitable
// for a student project.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// OAuth 2.0 Authorization Code + PKCE
router.get('/login/:provider', controller.oauthLogin);
router.get('/callback/:provider', controller.oauthCallback);
router.post('/refresh', controller.refreshToken);
router.get('/csrf', controller.csrfToken);

// Log out: instruct client to discard token (no server state to clear)
router.post('/logout', controller.logout);

module.exports = router;