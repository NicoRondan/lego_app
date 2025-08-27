const test = require('node:test');
const assert = require('node:assert');
const { parseCreateProduct } = require('../src/modules/catalog/dto');

test('parseCreateProduct defaults code and currency', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
  });
  assert.strictEqual(data.code, '123');
  assert.strictEqual(data.currency, 'USD');
});

test('parseCreateProduct uses provided code and currency', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
    code: 'ABC',
    currency: 'ARS',
  });
  assert.strictEqual(data.code, 'ABC');
  assert.strictEqual(data.currency, 'ARS');
});

test('parseCreateProduct accepts imageUrl', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
    imageUrl: 'https://example.com/img.jpg',
  });
  assert.strictEqual(data.imageUrl, 'https://example.com/img.jpg');
});
