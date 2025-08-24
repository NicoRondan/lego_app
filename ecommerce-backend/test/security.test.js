const test = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app/server');

async function setup() {
  const app = await createApp();
  return supertest(app);
}

test('security headers are set', async () => {
  const request = await setup();
  const res = await request.get('/products');
  assert.strictEqual(res.headers['x-frame-options'], 'DENY');
  assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  assert.ok(res.headers['strict-transport-security'].includes('max-age=31536000'));
});

test('CSRF protection requires token', async () => {
  const request = await setup();
  const csrfRes = await request.get('/auth/csrf');
  const csrfToken = csrfRes.body.csrfToken;
  const cookie = csrfRes.headers['set-cookie'][0];
  assert.ok(cookie.includes('SameSite=Lax'));
  assert.ok(cookie.includes('HttpOnly'));
  assert.ok(cookie.includes('Secure'));

  await request
    .post('/graphql')
    .set('Cookie', cookie)
    .send({ query: 'mutation { __typename }' })
    .expect(403);

  await request
    .post('/graphql')
    .set('Cookie', cookie)
    .set('x-csrf-token', csrfToken)
    .send({ query: 'mutation { __typename }' })
    .expect(200);
});

test('admin-only route enforcement', async () => {
  const request = await setup();
  const userToken = jwt.sign({ userId: 1, role: 'customer' }, process.env.JWT_SECRET || 'secret');
  const adminToken = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret');

  await request
    .post('/uploads')
    .set('Authorization', `Bearer ${userToken}`)
    .send({})
    .expect(403);

  await request
    .post('/uploads')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({})
    .expect(400);
});
