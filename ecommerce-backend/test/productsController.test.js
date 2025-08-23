const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { Op } = require('sequelize');

// Mock models
const modelsPath = path.resolve(__dirname, '../src/infra/models/index.js');
const Product = {
  findAndCountAll: async (args) => {
    Product.lastArgs = args;
    return { count: 1, rows: [{ id: 1, name: 'Mock', price: 150 }] };
  },
};
const mockModels = {
  Product,
  Category: {},
  Review: {},
  User: {},
};
require.cache[modelsPath] = { exports: mockModels };

const { getProducts } = require('../src/modules/catalog/controller');

test('getProducts applies filters, pagination and ordering', async () => {
  const req = { query: {
    search: 'mock',
    theme: 'city',
    minPrice: '100',
    maxPrice: '200',
    page: '2',
    limit: '5',
    order: 'price_desc',
  } };
  let output;
  const res = { json: (data) => { output = data; } };
  await getProducts(req, res, (err) => { if (err) throw err; });

  assert.deepStrictEqual(output, {
    total: 1,
    limit: 5,
    page: 2,
    items: [{ id: 1, name: 'Mock', price: 150 }],
  });

  assert.strictEqual(Product.lastArgs.limit, 5);
  assert.strictEqual(Product.lastArgs.offset, 5);
  assert.deepStrictEqual(Product.lastArgs.order, [['price', 'DESC']]);
  assert.strictEqual(Product.lastArgs.where.price[Op.gte], 100);
  assert.strictEqual(Product.lastArgs.where.price[Op.lte], 200);
  assert.ok(Product.lastArgs.where[Op.or]);
});
