// src/modules/admin/inventoryController.js
const { ApiError } = require('../../shared/errors');
const { adjustStock, setSafetyStock, listInventory, getMovements } = require('../inventory/service');

// GET /admin/inventory?lowStockOnly=&q=&page=&pageSize=
exports.list = async (req, res, next) => {
  try {
    const { lowStockOnly, q, page = 1, pageSize = 20 } = req.query || {};
    const low = String(lowStockOnly || '').toLowerCase() === 'true' || lowStockOnly === '1';
    const data = await listInventory({ q: q || '', lowStockOnly: low, page, pageSize });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/inventory/:productId/adjust body: { qty, reason }
exports.adjust = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { qty, reason } = req.body || {};
    const result = await adjustStock({ productId, qty, reason, userId: req.user?.id }, null);
    res.json({ ok: true, productId: Number(productId), stock: result.product.stock });
  } catch (err) {
    next(err);
  }
};

// PUT /admin/inventory/:productId/safety body: { safetyStock }
exports.updateSafety = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { safetyStock } = req.body || {};
    const inv = await setSafetyStock({ productId, safetyStock }, null);
    res.json({ ok: true, productId: Number(productId), safetyStock: inv.safetyStock });
  } catch (err) {
    next(err);
  }
};

// GET /admin/inventory/:productId/movements?limit=
exports.movements = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 20 } = req.query || {};
    const items = await getMovements({ productId, limit });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

