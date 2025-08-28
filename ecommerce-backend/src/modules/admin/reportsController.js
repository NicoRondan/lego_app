const { sequelize } = require('../../infra/models');
const { QueryTypes } = require('sequelize');

function parseDateParam(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

function parseStatusesParam(v) {
  if (!v) return ['paid', 'shipped', 'delivered'];
  return String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function sendCsv(res, filename, headers, rows) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const escapeCsv = (val) => {
    if (val == null) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(',')].concat(
    rows.map((r) => headers.map((h) => escapeCsv(r[h])).join(','))
  );
  res.send(lines.join('\n'));
}

// GET /admin/reports/sales/summary
exports.salesSummary = async (req, res, next) => {
  try {
    const {
      from = '',
      to = '',
      groupBy = 'day',
      status = '',
      format = '',
    } = req.query || {};

    const fromDate = parseDateParam(from) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = parseDateParam(to) || new Date();
    const statuses = parseStatusesParam(status);

    // Compute periodStart as an ISO date string:
    // - day:    the same day
    // - week:   Monday of the week containing created_at
    // - month:  first day of the month
    let periodStartExpr;
    if (groupBy === 'month') {
      periodStartExpr = "date(o.created_at, 'start of month')";
    } else if (groupBy === 'week') {
      // Monday of week: subtract the offset between current weekday and Monday
      periodStartExpr = "date(o.created_at, '-' || ((cast(strftime('%w', o.created_at) as integer) + 6) % 7) || ' days')";
    } else {
      periodStartExpr = "date(o.created_at)"; // day
    }

    const sql = `
      SELECT
        ${periodStartExpr} AS periodStart,
        COUNT(DISTINCT o.id) AS orders,
        COALESCE(SUM(oi.quantity), 0) AS qty,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS gross,
        COALESCE(SUM(COALESCE(o.discount_total, 0)), 0) AS discount,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) - COALESCE(SUM(COALESCE(o.discount_total, 0)), 0) AS net
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status IN (:statuses)
        AND date(o.created_at) >= date(:from)
        AND date(o.created_at) <= date(:to)
      GROUP BY periodStart
      ORDER BY periodStart ASC
    `;

    const rows = await sequelize.query(sql, {
      replacements: {
        statuses,
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
      },
      type: QueryTypes.SELECT,
    });

    const buckets = rows.map((r) => {
      const orders = Number(r.orders) || 0;
      const net = Number(r.net) || 0;
      return {
        periodStart: r.periodStart,
        orders: orders,
        qty: Number(r.qty) || 0,
        gross: Number(r.gross) || 0,
        discount: Number(r.discount) || 0,
        net: net,
        avgOrderValue: orders > 0 ? net / orders : 0,
      };
    });

    if (String(format).toLowerCase() === 'csv') {
      return sendCsv(
        res,
        `sales_summary_${groupBy}.csv`,
        ['periodStart', 'orders', 'qty', 'gross', 'discount', 'net', 'avgOrderValue'],
        buckets.map((b) => ({ ...b, avgOrderValue: b.avgOrderValue.toFixed(2) }))
      );
    }
    res.json({ buckets });
  } catch (err) {
    next(err);
  }
};

// GET /admin/reports/sales/by-theme
exports.salesByTheme = async (req, res, next) => {
  try {
    const { from = '', to = '', status = '', format = '' } = req.query || {};
    const fromDate = parseDateParam(from) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = parseDateParam(to) || new Date();
    const statuses = parseStatusesParam(status);

    // Net calculation: subtract order-level discount proportionally to line subtotal
    const sql = `
      WITH order_totals AS (
        SELECT oi.order_id, SUM(oi.unit_price * oi.quantity) AS order_gross
        FROM order_items oi
        GROUP BY oi.order_id
      )
      SELECT c.name AS theme,
             COUNT(DISTINCT o.id) AS orders,
             COALESCE(SUM(oi.quantity), 0) AS qty,
             COALESCE(SUM( (
               (oi.unit_price * oi.quantity)
               - (COALESCE(o.discount_total, 0) * (oi.unit_price * oi.quantity) / NULLIF(ot.order_gross, 0))
             ) ), 0) AS net
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      JOIN order_totals ot ON ot.order_id = o.id
      WHERE o.status IN (:statuses)
        AND date(o.created_at) >= date(:from)
        AND date(o.created_at) <= date(:to)
      GROUP BY c.name
      ORDER BY net DESC
    `;

    const rows = await sequelize.query(sql, {
      replacements: { statuses, from: fromDate.toISOString().slice(0,10), to: toDate.toISOString().slice(0,10) },
      type: QueryTypes.SELECT,
    });

    const result = rows.map((r) => ({
      theme: r.theme,
      orders: Number(r.orders) || 0,
      qty: Number(r.qty) || 0,
      net: Number(r.net) || 0,
    }));

    if (String(format).toLowerCase() === 'csv') {
      return sendCsv(res, 'sales_by_theme.csv', ['theme', 'orders', 'qty', 'net'], result);
    }
    res.json({ rows: result });
  } catch (err) {
    next(err);
  }
};

// GET /admin/reports/sales/top-products
exports.topProducts = async (req, res, next) => {
  try {
    const { from = '', to = '', status = '', limit = '10', format = '' } = req.query || {};
    const fromDate = parseDateParam(from) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = parseDateParam(to) || new Date();
    const statuses = parseStatusesParam(status);
    const lim = Math.min(parseInt(limit, 10) || 10, 100);

    const sql = `
      WITH order_totals AS (
        SELECT oi.order_id, SUM(oi.unit_price * oi.quantity) AS order_gross
        FROM order_items oi
        GROUP BY oi.order_id
      )
      SELECT p.id AS productId,
             p.set_number AS setNumber,
             p.name AS name,
             COALESCE(SUM(oi.quantity), 0) AS qty,
             COALESCE(SUM( (
               (oi.unit_price * oi.quantity)
               - (COALESCE(o.discount_total, 0) * (oi.unit_price * oi.quantity) / NULLIF(ot.order_gross, 0))
             ) ), 0) AS net
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      JOIN order_totals ot ON ot.order_id = o.id
      WHERE o.status IN (:statuses)
        AND date(o.created_at) >= date(:from)
        AND date(o.created_at) <= date(:to)
      GROUP BY p.id, p.set_number, p.name
      ORDER BY qty DESC, net DESC
      LIMIT :lim
    `;

    const rows = await sequelize.query(sql, {
      replacements: { statuses, from: fromDate.toISOString().slice(0,10), to: toDate.toISOString().slice(0,10), lim },
      type: QueryTypes.SELECT,
    });

    const result = rows.map((r) => ({
      productId: Number(r.productId),
      setNumber: r.setNumber || '',
      name: r.name,
      qty: Number(r.qty) || 0,
      net: Number(r.net) || 0,
    }));

    if (String(format).toLowerCase() === 'csv') {
      return sendCsv(res, 'top_products.csv', ['productId', 'setNumber', 'name', 'qty', 'net'], result);
    }
    res.json({ rows: result });
  } catch (err) {
    next(err);
  }
};

// GET /admin/reports/stock/low
exports.lowStock = async (req, res, next) => {
  try {
    const { threshold = '5', format = '' } = req.query || {};
    const safety = Math.max(0, parseInt(threshold, 10) || 0);

    const sql = `
      WITH reserved AS (
        SELECT oi.product_id, COALESCE(SUM(oi.quantity), 0) AS reserved
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('pending', 'paid', 'picking')
        GROUP BY oi.product_id
      )
      SELECT p.id AS productId,
             p.name AS name,
             p.stock AS stock,
             COALESCE(r.reserved, 0) AS reserved,
             :safety AS safetyStock
      FROM products p
      LEFT JOIN reserved r ON r.product_id = p.id
      WHERE (p.stock - COALESCE(r.reserved, 0)) <= :safety
      ORDER BY (p.stock - COALESCE(r.reserved, 0)) ASC
    `;

    const rows = await sequelize.query(sql, {
      replacements: { safety },
      type: QueryTypes.SELECT,
    });

    const result = rows.map((r) => ({
      productId: Number(r.productId),
      name: r.name,
      stock: Number(r.stock) || 0,
      reserved: Number(r.reserved) || 0,
      safetyStock: Number(r.safetyStock) || safety,
    }));

    if (String(format).toLowerCase() === 'csv') {
      return sendCsv(res, 'low_stock.csv', ['productId', 'name', 'stock', 'reserved', 'safetyStock'], result);
    }
    res.json({ rows: result });
  } catch (err) {
    next(err);
  }
};
