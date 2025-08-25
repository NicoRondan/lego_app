import { withItemsCount } from './cart';

describe('withItemsCount', () => {
  it('sums quantities across all items', () => {
    const cart = { items: [{ quantity: 2 }, { quantity: 3 }], summary: {} };
    const result = withItemsCount(cart);
    expect(result.summary.itemsCount).toBe(5);
  });
});
