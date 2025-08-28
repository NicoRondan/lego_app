const test = require('node:test');
const assert = require('node:assert');
const { validateAndPriceCoupon } = require('../src/modules/promotions/engine');

function makeCart({ items }) {
  return { items: items.map((it) => ({
    productId: it.productId || it.product?.id,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    Product: it.product || null,
  })) };
}

const models = {
  CouponUsage: { count: async () => 0 },
};

test('percent coupon applies banker rounding and caps to subtotal for fixed', async () => {
  const cart = makeCart({ items: [ { quantity: 3, unitPrice: 10, product: { allowCoupon: true } } ] });
  let res = await validateAndPriceCoupon({ coupon: { id: 1, type: 'percent', value: 10, status: 'active' }, userId: 1, cart, models });
  assert.ok(res.ok);
  assert.equal(res.discount.toFixed(2), '3.00');

  res = await validateAndPriceCoupon({ coupon: { id: 2, type: 'fixed', value: 50, status: 'active' }, userId: 1, cart, models });
  assert.ok(res.ok);
  // subtotal is 30; fixed 50 should cap at 30
  assert.equal(res.discount.toFixed(2), '30.00');
});

test('minSubtotal rule enforced', async () => {
  const cart = makeCart({ items: [ { quantity: 1, unitPrice: 10, product: { allowCoupon: true } } ] });
  const res = await validateAndPriceCoupon({ coupon: { id: 3, type: 'fixed', value: 5, status: 'active', minSubtotal: 50 }, userId: 1, cart, models });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_MIN_SUBTOTAL');
});

test('allowedThemes and disallowProducts', async () => {
  const cart = makeCart({ items: [
    { quantity: 1, unitPrice: 10, product: { id: 1, code: 'CITY001', allowCoupon: true, categories: [{ name: 'City' }] } },
    { quantity: 1, unitPrice: 100, product: { id: 2, code: 'SW001', allowCoupon: true, categories: [{ name: 'Star Wars' }] } },
  ]});
  // Requires Star Wars theme
  let res = await validateAndPriceCoupon({ coupon: { id: 4, type: 'percent', value: 10, status: 'active', allowedThemes: ['Star Wars'] }, userId: 1, cart, models });
  assert.ok(res.ok);
  // Disallow City product
  res = await validateAndPriceCoupon({ coupon: { id: 5, type: 'percent', value: 10, status: 'active', disallowProducts: ['CITY001'] }, userId: 1, cart, models });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_NOT_APPLICABLE');
});

test('disallowed on items with allowCoupon=false', async () => {
  const cart = makeCart({ items: [ { quantity: 1, unitPrice: 20, product: { allowCoupon: false } } ] });
  const res = await validateAndPriceCoupon({ coupon: { id: 6, type: 'percent', value: 10, status: 'active' }, userId: 1, cart, models });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_NOT_APPLICABLE');
});

test('date window and usage limits', async () => {
  const cart = makeCart({ items: [ { quantity: 1, unitPrice: 100, product: { allowCoupon: true } } ] });
  let res = await validateAndPriceCoupon({ coupon: { id: 7, type: 'percent', value: 10, status: 'active', validFrom: new Date(Date.now() + 86400000) }, userId: 1, cart, models });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_EXPIRED');

  res = await validateAndPriceCoupon({ coupon: { id: 8, type: 'percent', value: 10, status: 'active', validTo: new Date(Date.now() - 86400000) }, userId: 1, cart, models });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_EXPIRED');

  const modelsUsageMaxed = { CouponUsage: { count: async (where) => where.where.userId ? 0 : 5 } };
  res = await validateAndPriceCoupon({ coupon: { id: 9, type: 'percent', value: 10, status: 'active', maxUses: 5 }, userId: 1, cart, models: modelsUsageMaxed });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_LIMIT_REACHED');

  const modelsUserLimited = { CouponUsage: { count: async (where) => where.where.userId ? 1 : 0 } };
  res = await validateAndPriceCoupon({ coupon: { id: 10, type: 'percent', value: 10, status: 'active', perUserLimit: 1 }, userId: 1, cart, models: modelsUserLimited });
  assert.equal(res.ok, false);
  assert.equal(res.code, 'COUPON_LIMIT_REACHED');
});
