const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// Mock the models module before requiring controller
const modelsPath = path.resolve(__dirname, '../src/infra/models/index.js');
const mockModels = {
  Cart: {},
  CartItem: {
    findOne: async (args) => {
      mockModels.CartItem.lastArgs = args;
      return null; // Simulate not finding item for unauthorized user
    },
  },
  Product: {},
};
require.cache[modelsPath] = { exports: mockModels };

const { updateItem, removeItem } = require('../src/modules/cart/controller');
const { ApiError } = require('../src/shared/errors');
const resolvers = require('../src/graphql/resolvers');

test('updateItem prevents modifying another user\'s cart item', async () => {
  let error;
  const req = { user: { id: 2 }, params: { id: '1' }, body: { quantity: 3 } };
  const res = { json: () => {} };
  const next = (err) => { error = err; };
  await updateItem(req, res, next);
  assert.ok(error instanceof ApiError);
  assert.strictEqual(error.status, 404);
  assert.strictEqual(mockModels.CartItem.lastArgs.include.model, mockModels.Cart);
  assert.deepStrictEqual(mockModels.CartItem.lastArgs.include.where, { userId: 2 });
});

test('removeItem prevents deleting another user\'s cart item', async () => {
  let error;
  const req = { user: { id: 2 }, params: { id: '1' } };
  const res = { json: () => {} };
  const next = (err) => { error = err; };
  await removeItem(req, res, next);
  assert.ok(error instanceof ApiError);
  assert.strictEqual(error.status, 404);
  assert.strictEqual(mockModels.CartItem.lastArgs.include.model, mockModels.Cart);
  assert.deepStrictEqual(mockModels.CartItem.lastArgs.include.where, { userId: 2 });
});

test('GraphQL updateCartItem prevents cross-user modification', async () => {
  const models = {
    Cart: {},
    CartItem: {
      findOne: async (args) => {
        models.CartItem.lastArgs = args;
        return null;
      },
    },
    Product: {},
  };
  await assert.rejects(
    resolvers.Mutation.updateCartItem(null, { itemId: 1, quantity: 2 }, { models, user: { id: 2 } }),
    /Cart item not found/
  );
  assert.strictEqual(models.CartItem.lastArgs.include.model, models.Cart);
  assert.deepStrictEqual(models.CartItem.lastArgs.include.where, { userId: 2 });
});

test('GraphQL removeCartItem prevents cross-user deletion', async () => {
  const models = {
    Cart: {},
    CartItem: {
      findOne: async (args) => {
        models.CartItem.lastArgs = args;
        return null;
      },
    },
    Product: {},
  };
  await assert.rejects(
    resolvers.Mutation.removeCartItem(null, { itemId: 1 }, { models, user: { id: 2 } }),
    /Cart item not found/
  );
  assert.strictEqual(models.CartItem.lastArgs.include.model, models.Cart);
  assert.deepStrictEqual(models.CartItem.lastArgs.include.where, { userId: 2 });
});
