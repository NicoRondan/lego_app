const express = require('express');
const router = express.Router();
const controller = require('./usersController');

// GET /admin/users
router.get('/', controller.listUsers);

// GET /admin/users/:id
router.get('/:id', controller.getUser);

// PUT /admin/users/:id
router.put('/:id', controller.updateUser);

// Impersonation
router.post('/:id/impersonate', controller.impersonate);

// Addresses
router.get('/:id/addresses', controller.listAddresses);
router.post('/:id/addresses', controller.createAddress);
router.put('/:id/addresses/:addressId', controller.updateAddress);
router.delete('/:id/addresses/:addressId', controller.deleteAddress);

// Audit
router.get('/:id/audit', controller.listAudit);

module.exports = router;
