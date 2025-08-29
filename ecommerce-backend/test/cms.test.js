const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');
process.env.DB_URI = 'sqlite:' + path.join(__dirname, 'tmp_cms.sqlite');
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
  try { fs.unlinkSync(path.join(__dirname, 'tmp_cms.sqlite')); } catch {}
  await sequelize.sync({ force: true });
  // users
  const ph = await bcrypt.hash('password123', 10);
  await User.bulkCreate([
    { name: 'Marketing', email: 'marketing@example.com', role: 'marketing', passwordHash: ph },
    { name: 'Admin', email: 'admin@example.com', role: 'admin', passwordHash: ph },
  ]);
  app = await createApp();
});

test('admin can create banners and publish home layout, GET /home reflects it', async () => {
  const cookie = await login('marketing@example.com');
  const b = await request(app)
    .post('/admin/banners')
    .set('Cookie', cookie)
    .send({ title: 'Hero', imageUrl: 'https://example.com/img.jpg', linkUrl: '/products', placement: 'home-hero', isActive: true });
  assert.equal(b.status, 201);
  const bannerId = b.body.id;

  const hl = await request(app)
    .post('/admin/home-layout')
    .set('Cookie', cookie)
    .send({ json: { sections: [{ type: 'hero', bannerId }] }, publish: true });
  assert.equal(hl.status, 201);

  const home = await request(app).get('/home');
  assert.equal(home.status, 200);
  assert.ok(home.body.layout?.sections?.length > 0);
  assert.ok(home.body.bannersById && home.body.bannersById[bannerId]);
});

test('banners respect date windows', async () => {
  const cookie = await login('marketing@example.com');
  const pastEnd = new Date(Date.now() - 60*60*1000).toISOString();
  const b = await request(app)
    .post('/admin/banners')
    .set('Cookie', cookie)
    .send({ title: 'Expired', imageUrl: 'https://example.com/img2.jpg', placement: 'home-hero', isActive: true, endsAt: pastEnd });
  assert.equal(b.status, 201);
  const home = await request(app).get('/home');
  assert.equal(home.status, 200);
  const map = home.body.bannersById || {};
  // The expired banner should not be present
  assert.ok(!map[b.body.id]);
});

test('admin can create pages and public GET /pages/:slug works', async () => {
  const cookie = await login('admin@example.com');
  const now = new Date().toISOString();
  const p = await request(app)
    .post('/admin/pages')
    .set('Cookie', cookie)
    .send({ slug: 'terminos', title: 'Términos', body: '# Hello', publishedAt: now });
  assert.equal(p.status, 201);
  const pub = await request(app).get('/pages/terminos');
  assert.equal(pub.status, 200);
  assert.equal(pub.body.slug, 'terminos');
});

test('GET /pages/:slug returns 404 for unknown', async () => {
  const res = await request(app).get('/pages/unknown');
  assert.equal(res.status, 404);
});

