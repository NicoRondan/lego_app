const test = require('node:test');
const assert = require('node:assert');
const { graphql } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const typeDefs = require('../src/graphql/typeDefs');
const resolvers = require('../src/graphql/resolvers');

// Integration test for GraphQL mutations using the real schema and resolvers.

test('addToCart mutation adds an item', async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const product = { id: 1, price: 10 };
  const cart = { id: 1 };
  const cartItem = { id: 1, quantity: 0, unitPrice: 10, save: async function() { this.quantity = this.quantity; } };

  const models = {
    Product: { findByPk: async () => product },
    Cart: {
      findOrCreate: async () => [cart, true],
      findByPk: async () => ({ id: 1, items: [{ id: cartItem.id, quantity: cartItem.quantity, unitPrice: 10, product }] }),
    },
    CartItem: {
      findOrCreate: async () => [cartItem, true],
    },
  };

  const mutation = `mutation { addToCart(productId: "1", quantity: 2) { id items { quantity product { id } } } }`;

  const result = await graphql({ schema, source: mutation, contextValue: { models, user: { id: 1 } } });

  assert.ifError(result.errors);
  assert.strictEqual(result.data.addToCart.id, '1');
  assert.strictEqual(result.data.addToCart.items[0].product.id, '1');
  assert.strictEqual(result.data.addToCart.items[0].quantity, 2);
});

test('createMpPreference generates a payment record', async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const order = { id: 1, userId: 1, total: 99.99, status: 'pending' };
  let createdPayment;
  const models = {
    Order: { findOne: async () => order },
    Payment: { create: async (data) => { createdPayment = data; return data; } },
  };
  const mutation = `mutation { createMpPreference(orderId: "1") { provider status amount } }`;
  const result = await graphql({ schema, source: mutation, contextValue: { models, user: { id: 1 } } });
  assert.ifError(result.errors);
  assert.strictEqual(result.data.createMpPreference.provider, 'mp');
  assert.strictEqual(createdPayment.amount, 99.99);
});
