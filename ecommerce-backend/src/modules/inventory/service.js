// src/modules/inventory/service.js
// Central inventory operations: adjust, reserve, release, sale, return

const { sequelize, Product, Inventory, InventoryMovement, OrderItem } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

async function ensureInventory(productId, t) {
  const [inv] = await Inventory.findOrCreate({ where: { productId }, defaults: { stock: 0, safetyStock: 0, reserved: 0 }, transaction: t });
  return inv;
}

async function adjustStock({ productId, qty, reason, userId }, t) {
  const parsed = parseInt(qty, 10);
  if (!Number.isInteger(parsed) || parsed === 0) throw new ApiError('qty must be a non-zero integer', 400);
  return sequelize.transaction({ transaction: t }, async (trx) => {
    const prod = await Product.findByPk(productId, { transaction: trx });
    if (!prod) throw new ApiError('Product not found', 404);
    const inv = await ensureInventory(productId, trx);
    const newStock = (parseInt(prod.stock, 10) || 0) + parsed;
    if (newStock < 0) throw new ApiError('Stock cannot go below zero', 400);
    prod.stock = newStock;
    await prod.save({ transaction: trx });
    inv.stock = (parseInt(inv.stock, 10) || 0) + parsed;
    if (inv.stock < 0) inv.stock = 0;
    await inv.save({ transaction: trx });
    await InventoryMovement.create({ productId, type: 'adjust', qty: parsed, reason: reason || '', userId: userId || null }, { transaction: trx });
    return { product: prod, inventory: inv };
  });
}

async function setSafetyStock({ productId, safetyStock }, t) {
  const value = parseInt(safetyStock, 10);
  if (!Number.isInteger(value) || value < 0) throw new ApiError('safetyStock must be >= 0', 400);
  const inv = await ensureInventory(productId, t);
  inv.safetyStock = value;
  await inv.save({ transaction: t });
  return inv;
}

async function listInventory({ q = '', lowStockOnly = false, page = 1, pageSize = 20 }) {
  const { Op } = require('sequelize');
  const p = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 20));
  const offset = (p - 1) * size;
  const where = {};
  if (q) {
    const like = { [Op.like]: `%${String(q).trim()}%` };
    where[Op.or] = [{ name: like }, { setNumber: like }, { code: like }];
  }
  const { rows: products, count } = await Product.findAndCountAll({ where, limit: size, offset, order: [['name', 'ASC']] });
  const productIds = products.map((p) => p.id);
  const invs = await Inventory.findAll({ where: { productId: productIds } });
  const invByPid = new Map(invs.map((i) => [i.productId, i]));
  let items = products.map((p) => {
    const inv = invByPid.get(p.id);
    const reserved = inv?.reserved || 0;
    const safetyStock = inv?.safetyStock || 0;
    const available = (parseInt(p.stock, 10) || 0) - (parseInt(reserved, 10) || 0);
    return {
      productId: p.id,
      code: p.code,
      setNumber: p.setNumber,
      name: p.name,
      stock: parseInt(p.stock, 10) || 0,
      reserved: parseInt(reserved, 10) || 0,
      safetyStock: parseInt(safetyStock, 10) || 0,
      available,
      low: available <= (parseInt(safetyStock, 10) || 0),
      warehouseLocation: inv?.warehouseLocation || null,
    };
  });
  if (lowStockOnly) items = items.filter((it) => it.low);
  return { items, page: p, pageSize: size, total: count };
}

async function getMovements({ productId, limit = 20 }) {
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const items = await InventoryMovement.findAll({ where: { productId }, order: [['createdAt', 'DESC']], limit: l });
  return items;
}

module.exports = {
  ensureInventory,
  adjustStock,
  setSafetyStock,
  listInventory,
  getMovements,
};

