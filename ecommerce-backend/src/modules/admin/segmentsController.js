// src/modules/admin/segmentsController.js
// Manage marketing segments. Computes segment size based on a simple DSL.

const { sequelize, Segment } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const { Op } = require('sequelize');

function normalizeDefinition(def) {
  const d = def && typeof def === 'object' ? def : {};
  const out = {};
  if (Array.isArray(d.theme)) out.theme = d.theme.map((t) => String(t));
  if (d.minAov != null) out.minAov = Number(d.minAov);
  if (d.lastOrderDaysLt != null) out.lastOrderDaysLt = Number(d.lastOrderDaysLt);
  if (d.hasWishlist != null) out.hasWishlist = Boolean(d.hasWishlist);
  return out;
}

async function computeSegmentSize(def) {
  const d = normalizeDefinition(def);
  const whereClauses = [];
  const params = {};

  // minAov
  if (d.minAov != null && !Number.isNaN(d.minAov)) {
    whereClauses.push(`(
      EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
      AND (
        (SELECT COALESCE(AVG(COALESCE(o.grand_total, o.total)), 0)
         FROM orders o WHERE o.user_id = u.id) >= :minAov
      )
    )`);
    params.minAov = d.minAov;
  }

  // lastOrderDaysLt
  if (d.lastOrderDaysLt != null && !Number.isNaN(d.lastOrderDaysLt)) {
    whereClauses.push(`(
      EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
      AND (
        (
          SELECT (julianday('now') - julianday(MAX(o.created_at)))
          FROM orders o WHERE o.user_id = u.id
        ) * 1.0 < :lastOrderDaysLt
      )
    )`);
    params.lastOrderDaysLt = d.lastOrderDaysLt;
  }

  // hasWishlist
  if (d.hasWishlist === true) {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM wishlists w
      JOIN wishlist_items wi ON wi.wishlist_id = w.id
      WHERE w.user_id = u.id
    )`);
  }

  // theme (via past orders OR wishlist items)
  if (Array.isArray(d.theme) && d.theme.length > 0) {
    whereClauses.push(`(
      EXISTS (
        SELECT 1 FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN product_categories pc ON pc.product_id = p.id
        JOIN categories c ON c.id = pc.category_id
        WHERE o.user_id = u.id AND c.name IN (:themes)
      )
      OR EXISTS (
        SELECT 1 FROM wishlists w
        JOIN wishlist_items wi ON wi.wishlist_id = w.id
        JOIN products p2 ON p2.id = wi.product_id
        JOIN product_categories pc2 ON pc2.product_id = p2.id
        JOIN categories c2 ON c2.id = pc2.category_id
        WHERE w.user_id = u.id AND c2.name IN (:themes)
      )
    )`);
    params.themes = d.theme;
  }

  const sql = `SELECT COUNT(*) as size FROM users u
    ${whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''}`;
  const [rows] = await sequelize.query(sql, { replacements: params });
  const size = rows?.[0]?.size ?? rows?.size ?? 0;
  return Number(size) || 0;
}

exports.list = async (req, res, next) => {
  try {
    const segments = await Segment.findAll({ order: [['id', 'DESC']] });
    // Optionally recompute size; keep fast by default.
    const withSize = await Promise.all(segments.map(async (s) => {
      const size = await computeSegmentSize(s.definition || {});
      // Update cached size but tolerate failures
      try { s.size = size; await s.save(); } catch (_) {}
      return s;
    }));
    res.json(withSize);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const name = (req.body?.name || '').toString().trim();
    if (!name && !req.body?.preview) throw new ApiError('name is required', 400);
    const definition = normalizeDefinition(req.body?.definition || {});
    const size = await computeSegmentSize(definition);
    if (req.body?.preview) {
      return res.json({ size, definition });
    }
    const seg = await Segment.create({ name, definition, size });
    res.status(201).json(seg);
  } catch (err) { next(err); }
};

module.exports = { computeSegmentSize };
