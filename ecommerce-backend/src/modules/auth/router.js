// src/modules/auth/router.js
// Routes for authentication. This module handles OAuth-based logins by
// accepting provider credentials and issuing JWTs. It does not implement
// the full OAuth redirect flow but provides a simplified API suitable
// for a student project.

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Log in with social provider. Expects body { provider, providerId, name, email }
router.post('/login', controller.login);

// Log out: instruct client to discard token (no server state to clear)
router.post('/logout', controller.logout);

module.exports = router;