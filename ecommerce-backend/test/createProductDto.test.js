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
    recommendedAgeMin: '8',
    recommendedAgeMax: '12',
    description: 'A cool set',
    releaseYear: '2024',
  });
  assert.strictEqual(data.code, '123');
  assert.strictEqual(data.currency, 'USD');
  assert.strictEqual(data.recommendedAgeMin, 8);
  assert.strictEqual(data.recommendedAgeMax, 12);
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
    recommendedAgeMin: '8',
    recommendedAgeMax: '12',
    description: 'A cool set',
    releaseYear: '2024',
    code: 'ABC',
    currency: 'ARS',
  });
  assert.strictEqual(data.code, 'ABC');
  assert.strictEqual(data.currency, 'ARS');
  assert.strictEqual(data.recommendedAgeMin, 8);
  assert.strictEqual(data.recommendedAgeMax, 12);
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
    recommendedAgeMin: '8',
    recommendedAgeMax: '12',
    description: 'A cool set',
    releaseYear: '2024',
    imageUrl: 'https://example.com/img.jpg',
  });
  assert.strictEqual(data.imageUrl, 'https://example.com/img.jpg');
  assert.strictEqual(data.recommendedAgeMin, 8);
  assert.strictEqual(data.recommendedAgeMax, 12);
  assert.strictEqual(data.description, 'A cool set');
  assert.strictEqual(data.releaseYear, 2024);
});

test('parseCreateProduct parses construction and logistics fields', () => {
  const data = parseCreateProduct({
    setNumber: '123',
    name: 'Brick Set',
    slug: '123-brick-set',
    price: '19.99',
    stock: '5',
    recommendedAgeMin: '8',
    recommendedAgeMax: '12',
    description: 'A cool set',
    releaseYear: '2024',
    pieces: '1000',
    minifigCount: '3',
    weightGrams: '500',
    boxWidthMm: '100',
    boxHeightMm: '50',
    boxDepthMm: '80',
  });
  assert.strictEqual(data.pieceCount, 1000);
  assert.strictEqual(data.minifigCount, 3);
  assert.strictEqual(data.weightGrams, 500);
  assert.strictEqual(data.boxWidthMm, 100);
  assert.strictEqual(data.boxHeightMm, 50);
  assert.strictEqual(data.boxDepthMm, 80);
});

test('parseCreateProduct requires recommendedAgeMin and recommendedAgeMax', () => {
  assert.throws(
    () =>
      parseCreateProduct({
        setNumber: '123',
        name: 'Brick Set',
        slug: '123-brick-set',
        price: '19.99',
        stock: '5',
        recommendedAgeMax: '12',
        description: 'A cool set',
        releaseYear: '2024',
      }),
    /recommendedAgeMin is required/
  );
  assert.throws(
    () =>
      parseCreateProduct({
        setNumber: '123',
        name: 'Brick Set',
        slug: '123-brick-set',
        price: '19.99',
        stock: '5',
        recommendedAgeMin: '8',
        description: 'A cool set',
        releaseYear: '2024',
      }),
    /recommendedAgeMax is required/
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
        recommendedAgeMin: '8',
        recommendedAgeMax: '12',
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
        recommendedAgeMin: '8',
        recommendedAgeMax: '12',
        description: 'A cool set',
      }),
    /releaseYear is required/
  );
});
