const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { createApp } = require('../src/app/server');
const { sequelize } = require('../src/infra/models');

let app;
let adminToken;

function fmtDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

test.before(async () => {
  // Ensure schema exists without forcing drop to avoid interfering with other tests
  await sequelize.sync();
  app = await createApp();
  const secret = process.env.JWT_SECRET || 'secret';
  adminToken = jwt.sign({ userId: 1, role: 'admin' }, secret, { expiresIn: '1h' });
});

test('sales summary grouped by week starts on Monday', async () => {
  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const res = await request(app)
    .get('/admin/reports/sales/summary')
    .set('Authorization', `Bearer ${adminToken}`)
    .query({ from: fmtDate(from), to: fmtDate(to), groupBy: 'week' })
    .expect(200);
  assert.ok(res.body && Array.isArray(res.body.buckets));
  // Only assert Monday alignment when there is data
  if (res.body.buckets.length > 0) {
    for (const b of res.body.buckets) {
      const day = new Date(b.periodStart).getDay();
      assert.equal(day, 1, `Expected Monday periodStart, got ${b.periodStart}`);
    }
  }
});

test('sales by theme returns rows with net and qty', async () => {
  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const res = await request(app)
    .get('/admin/reports/sales/by-theme')
    .set('Authorization', `Bearer ${adminToken}`)
    .query({ from: fmtDate(from), to: fmtDate(to) })
    .expect(200);
  assert.ok(res.body && Array.isArray(res.body.rows));
  for (const r of res.body.rows) {
    assert.ok(typeof r.theme === 'string' && r.theme.length > 0);
    assert.ok(r.qty >= 0);
    assert.ok(r.net >= 0);
  }
});

test('top products ordered by qty desc and limited', async () => {
  const to = new Date();
  const from = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const res = await request(app)
    .get('/admin/reports/sales/top-products')
    .set('Authorization', `Bearer ${adminToken}`)
    .query({ from: fmtDate(from), to: fmtDate(to), limit: 5 })
    .expect(200);
  const rows = res.body.rows || [];
  assert.ok(rows.length <= 5);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].qty >= rows[i].qty, 'rows not sorted by qty desc');
  }
});

test('summary CSV export returns csv with headers', async () => {
  const to = new Date();
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const res = await request(app)
    .get('/admin/reports/sales/summary')
    .set('Authorization', `Bearer ${adminToken}`)
    .query({ from: fmtDate(from), to: fmtDate(to), groupBy: 'day', format: 'csv' })
    .expect(200);
  assert.match(res.headers['content-type'], /text\/csv/);
  const lines = res.text.trim().split(/\r?\n/);
  assert.ok(lines.length >= 1);
  assert.equal(lines[0].split(',')[0], 'periodStart');
});

test('low stock respects stock - reserved <= safety', async () => {
  const res = await request(app)
    .get('/admin/reports/stock/low')
    .set('Authorization', `Bearer ${adminToken}`)
    .query({ threshold: 10 })
    .expect(200);
  for (const r of (res.body.rows || [])) {
    assert.ok((r.stock - r.reserved) <= r.safetyStock);
  }
});

test.after(async () => {
  await sequelize.close();
});
