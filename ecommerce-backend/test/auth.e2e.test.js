const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { createApp } = require('../src/app/server');
const { sequelize } = require('../src/infra/models');

let app;

test.before(async () => {
  await sequelize.sync({ force: true });
  app = await createApp();
});

test('register and login flow sets cookies', async () => {
  const agent = request.agent(app);
  const reg = await agent
    .post('/auth/register')
    .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
  assert.equal(reg.status, 201);
  assert.ok(reg.headers['set-cookie'].some((c) => c.startsWith('accessToken=')));
  const login = await agent
    .post('/auth/login')
    .send({ email: 'alice@example.com', password: 'password123' });
  assert.equal(login.status, 200);
  assert.ok(login.headers['set-cookie'].some((c) => c.startsWith('accessToken=')));
});

test('refresh rotates token', async () => {
  const agent = request.agent(app);
  await agent
    .post('/auth/register')
    .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });
  const res = await agent.post('/auth/refresh');
  assert.equal(res.status, 200);
  assert.ok(res.headers['set-cookie'].some((c) => c.startsWith('accessToken=')));
});
