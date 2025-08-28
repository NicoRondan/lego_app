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
    recommendedAge: '8',
    description: 'A cool set',
    releaseYear: '2024',
  });
  assert.strictEqual(data.code, '123');
  assert.strictEqual(data.currency, 'USD');
  assert.strictEqual(data.recommendedAge, 8);
  assert.strictEqual(data.description, 'A cool set');
  assert.strictEqual(data.releaseYear, 2024);
});

test('parseCreateProduct uses provided code and currency', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
    recommendedAge: '8',
    description: 'A cool set',
    releaseYear: '2024',
    code: 'ABC',
    currency: 'ARS',
  });
  assert.strictEqual(data.code, 'ABC');
  assert.strictEqual(data.currency, 'ARS');
  assert.strictEqual(data.recommendedAge, 8);
  assert.strictEqual(data.description, 'A cool set');
  assert.strictEqual(data.releaseYear, 2024);
});

test('parseCreateProduct accepts imageUrl', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
    recommendedAge: '8',
    description: 'A cool set',
    releaseYear: '2024',
    imageUrl: 'https://example.com/img.jpg',
  });
  assert.strictEqual(data.imageUrl, 'https://example.com/img.jpg');
  assert.strictEqual(data.recommendedAge, 8);
  assert.strictEqual(data.description, 'A cool set');
  assert.strictEqual(data.releaseYear, 2024);
});

test('parseCreateProduct requires recommendedAge', () => {
    assert.throws(
      () =>
        parseCreateProduct({
          setNumber: '123',
          name: 'Brick Set',
          slug: '123-brick-set',
          price: '19.99',
          stock: '5',
          description: 'A cool set',
          releaseYear: '2024',
        }),
      /recommendedAge is required/
    );
  });

test('parseCreateProduct requires description', () => {
  assert.throws(
    () =>
      parseCreateProduct({
        setNumber: '123',
        name: 'Brick Set',
        slug: '123-brick-set',
        price: '19.99',
        stock: '5',
        recommendedAge: '8',
        releaseYear: '2024',
      }),
    /description is required/
  );
});

test('parseCreateProduct requires releaseYear', () => {
  assert.throws(
    () =>
      parseCreateProduct({
        setNumber: '123',
        name: 'Brick Set',
        slug: '123-brick-set',
        price: '19.99',
        stock: '5',
        recommendedAge: '8',
        description: 'A cool set',
      }),
    /releaseYear is required/
  );
});
