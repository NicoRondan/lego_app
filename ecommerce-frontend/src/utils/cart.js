export function withItemsCount(cart) {
  if (!cart) return cart;
  const itemsCount = (cart.items || []).reduce(
    (sum, it) => sum + it.quantity,
    0,
  );
  // itemsCount represents total quantity across all line items, not the number of distinct items.
  return { ...cart, summary: { ...(cart.summary || {}), itemsCount } };
}
