const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
process.env.DB_URI = 'sqlite:' + path.join(__dirname, 'tmp_admin_users.sqlite');
const request = require('supertest');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app/server');
const { sequelize, User } = require('../src/infra/models');
let app;

async function login(email, password = 'password123') {
  const res = await request(app).post('/auth/login').send({ email, password });
  assert.equal(res.status, 200);
  const cookies = res.headers['set-cookie'] || [];
  return cookies.map((c) => c.split(';')[0]).join('; ');
}

test('setup app', async () => {
  try { fs.unlinkSync(path.join(__dirname, 'tmp_admin_users.sqlite')); } catch {}
  await sequelize.sync({ force: true });
  // minimal fixtures
  const ph = await bcrypt.hash('password123', 10);
  await User.bulkCreate([
    { name: 'Catalog', email: 'catalog_manager@example.com', role: 'catalog_manager', passwordHash: ph },
    { name: 'Support', email: 'support@example.com', role: 'support', passwordHash: ph },
    { name: 'Admin 1', email: 'admin1@example.com', role: 'admin', passwordHash: ph },
    { name: 'Cust 1', email: 'cust1@example.com', role: 'customer', passwordHash: ph },
  ]);
  app = await createApp();
});

test('RBAC: catalog_manager denied; support allowed; legacy admin allowed', async () => {
  const cmCookie = await login('catalog_manager@example.com');
  const r1 = await request(app).get('/admin/users').set('Cookie', cmCookie);
  assert.equal(r1.status, 403);

  const supCookie = await login('support@example.com');
  const r2 = await request(app).get('/admin/users').set('Cookie', supCookie);
  assert.equal(r2.status, 200);
  assert.ok(Array.isArray(r2.body.data));

  const adminCookie = await login('admin1@example.com');
  const r3 = await request(app).get('/admin/users').set('Cookie', adminCookie);
  assert.equal(r3.status, 200);
});

test('Addresses CRUD respects isDefault within type', async () => {
  const cookie = await login('support@example.com');
  // pick a customer
  const uid = 4; // created above

  // create shipping default A1
  const a1 = await request(app)
    .post(`/admin/users/${uid}/addresses`)
    .set('Cookie', cookie)
    .send({ type: 'shipping', name: 'Home', line1: 'A1', city: 'X', isDefault: true });
  assert.equal(a1.status, 201);
  assert.ok(a1.body.isDefault);

  // create shipping default A2 (should unset A1)
  const a2 = await request(app)
    .post(`/admin/users/${uid}/addresses`)
    .set('Cookie', cookie)
    .send({ type: 'shipping', name: 'Work', line1: 'A2', city: 'Y', isDefault: true });
  assert.equal(a2.status, 201);
  assert.ok(a2.body.isDefault);

  // verify only one default per type
  const listAddr = await request(app).get(`/admin/users/${uid}/addresses`).set('Cookie', cookie);
  assert.equal(listAddr.status, 200);
  const shipDefaults = listAddr.body.filter((a) => a.type === 'shipping' && a.isDefault);
  assert.equal(shipDefaults.length, 1);

  // update A2 to not default
  const upd = await request(app)
    .put(`/admin/users/${uid}/addresses/${a2.body.id}`)
    .set('Cookie', cookie)
    .send({ isDefault: false });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.isDefault, 0);

  // delete A1
  const del = await request(app)
    .delete(`/admin/users/${uid}/addresses/${a1.body.id}`)
    .set('Cookie', cookie);
  assert.equal(del.status, 200);
});
