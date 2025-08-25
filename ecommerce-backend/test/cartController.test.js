const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const modelsPath = path.resolve(__dirname, '../src/infra/models/index.js');
// Prepare mock container that controllers will use
const mockModels = { Cart: {}, CartItem: {}, Product: {} };
require.cache[modelsPath] = { exports: mockModels };

const { addItem, removeItem } = require('../src/modules/cart/controller');
const { ApiError } = require('../src/shared/errors');

// Añadir artículo nuevo al carrito
test('addItem adds a new product to the cart', async () => {
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

  assert.strictEqual(item.quantity, 2);
  assert.strictEqual(item.subtotal, 20);
  assert.strictEqual(output.total, 20);
});

// Incrementar cantidad cuando el artículo ya existe en el carrito
test('addItem increments quantity for an existing item', async () => {
  const item = { quantity: 2, unitPrice: 10, subtotal: 20, save: async function(){ return this; }, cartId: 1, productId: 1 };
  mockModels.Product.findByPk = async () => ({ id: 1, price: 10, stock: 10 });
  mockModels.Cart.findOrCreate = async () => [{ id: 1 }];
  mockModels.CartItem.findOrCreate = async () => [item];
  mockModels.Cart.findByPk = async () => ({
    id: 1,
    items: [item],
    toJSON() { return { id: 1, items: [item] }; },
  });

  let output;
  const req = { user: { id: 1 }, body: { productId: 1, quantity: 3 } };
  const res = { json: (data) => { output = data; } };
  await addItem(req, res, (err) => { if (err) throw err; });

  assert.strictEqual(item.quantity, 5);
  assert.strictEqual(item.subtotal, 50);
  assert.strictEqual(output.total, 50);
});

// Validar que no se acepten cantidades negativas
test('addItem rejects negative quantities', async () => {
  let error;
  const req = { user: { id: 1 }, body: { productId: 1, quantity: -2 } };
  const res = { json: () => {} };
  await addItem(req, res, (err) => { error = err; });

  assert.ok(error instanceof ApiError);
  assert.match(error.message, /quantity must be positive/);
});

// Eliminar artículo del carrito
test('removeItem deletes an item from the cart', async () => {
  let destroyed = false;
  const item = { id: 1, cartId: 1, destroy: async () => { destroyed = true; } };
  mockModels.CartItem.findOne = async () => item;
  mockModels.Cart.findOne = async () => ({
    id: 1,
    items: [],
    toJSON() { return { id: 1, items: [] }; },
  });

  let output;
  const req = { user: { id: 1 }, params: { id: '1' } };
  const res = { json: (data) => { output = data; } };
  await removeItem(req, res, (err) => { if (err) throw err; });

  assert.ok(destroyed);
  assert.strictEqual(output.total, 0);
});

