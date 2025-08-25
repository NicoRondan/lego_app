const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const modelsPath = path.resolve(__dirname, '../src/infra/models/index.js');
// Prepare mock container that controllers will use
const mockModels = { Cart: {}, CartItem: {}, Product: {} };
require.cache[modelsPath] = { exports: mockModels };

const { addItem, updateItem } = require('../src/modules/cart/controller');
const { ApiError } = require('../src/shared/errors');

test('addItem computes subtotal and cart total', async () => {
  const item = { quantity: 0, unitPrice: 0, subtotal: 0, save: async function(){ return this; }, cartId: 1, productId: 1 };
  mockModels.Product.findByPk = async () => ({ id: 1, price: 10, stock: 5 });
  mockModels.Cart.findOrCreate = async () => [{ id: 1 }];
  mockModels.CartItem.findOrCreate = async () => [item];
  mockModels.Cart.findByPk = async () => ({
    id: 1,
    items: [item],
    toJSON() { return { id: 1, items: [item] }; },
  });

  let output;
  const req = { user: { id: 1 }, body: { productId: 1, quantity: 2 } };
  const res = { json: (data) => { output = data; } };
  await addItem(req, res, (err) => { if (err) throw err; });
  assert.strictEqual(item.subtotal, 20);
  assert.strictEqual(output.total, 20);
});

test('addItem validates available stock', async () => {
  const item = { quantity: 0, unitPrice: 0, save: async function(){ return this; }, cartId: 1, productId: 1 };
  mockModels.Product.findByPk = async () => ({ id: 1, price: 10, stock: 1 });
  mockModels.Cart.findOrCreate = async () => [{ id: 1 }];
  mockModels.CartItem.findOrCreate = async () => [item];

  let error;
  const req = { user: { id: 1 }, body: { productId: 1, quantity: 3 } };
  const res = { json: () => {} };
  await addItem(req, res, (err) => { error = err; });
  assert.ok(error instanceof ApiError);
  assert.match(error.message, /Insufficient stock/);
});

test('updateItem computes subtotal and cart total', async () => {
  const item = { cartId: 1, productId: 1, quantity: 1, unitPrice: 10, subtotal: 10, save: async function(){ return this; } };
  mockModels.CartItem.findOne = async () => item;
  mockModels.Product.findByPk = async () => ({ id: 1, price: 10, stock: 5 });
  mockModels.Cart.findOne = async () => ({
    id: 1,
    items: [item],
    toJSON() { return { id: 1, items: [item] }; },
  });

  let output;
  const req = { user: { id: 1 }, params: { id: '1' }, body: { quantity: 3 } };
  const res = { json: (data) => { output = data; } };
  await updateItem(req, res, (err) => { if (err) throw err; });
  assert.strictEqual(item.subtotal, 30);
  assert.strictEqual(output.total, 30);
});

test('updateItem validates available stock', async () => {
  const item = { cartId: 1, productId: 1, quantity: 1, unitPrice: 10, save: async function(){ return this; } };
  mockModels.CartItem.findOne = async () => item;
  mockModels.Product.findByPk = async () => ({ id: 1, price: 10, stock: 2 });

  let error;
  const req = { user: { id: 1 }, params: { id: '1' }, body: { quantity: 5 } };
  const res = { json: () => {} };
  await updateItem(req, res, (err) => { error = err; });
  assert.ok(error instanceof ApiError);
  assert.match(error.message, /Insufficient stock/);
});
