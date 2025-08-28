// src/modules/cart/controller.js
// Controller functions for cart routes. Performs CRUD operations on
// Cart and CartItem models. Authentication is required on all actions.

const { Cart, CartItem, Product, Category, Coupon } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// Determine a product's effective unit price based on sale price vs MSRP
function getEffectivePrice(product) {
  const salePrice = product.price != null ? parseFloat(product.price) : null;
  const msrp = product.msrp != null ? parseFloat(product.msrp) : null;
  return salePrice != null ? salePrice : msrp;
}

// Helper to attach cart totals and expose a simplified item structure
function attachTotal(cart) {
  if (!cart) return null;
  const data = cart.toJSON();

  // Map items to only expose required fields
  const items = (data.items || []).map((it) => ({
    id: it.id,
    productId: it.productId,
    displayName: it.displayName,
    thumbnailUrl: it.thumbnailUrl,
    unitPrice: parseFloat(it.unitPrice),
    quantity: it.quantity,
  }));

  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const discount = data.discountTotal ? parseFloat(data.discountTotal) : 0;
  const grand = Math.max(0, subtotal - discount);

  data.items = items;
  data.subtotal = subtotal;
  data.discountTotal = discount;
  data.total = grand;
  return data;
}

// GET /cart
exports.getCart = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const cart = await Cart.findOne({
      where: { userId: user.id },
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    res.json(attachTotal(cart));
  } catch (err) {
    next(err);
  }
};

// POST /cart/items
exports.addItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const dto = require('./dto');
    const { productId, quantity } = dto.parseAddItem(req.body);
    const product = await Product.findByPk(productId);
    if (!product) throw new ApiError('Product not found', 404);
    if (product.status === 'discontinued') throw new ApiError('Product discontinued', 400);
    const [cart] = await Cart.findOrCreate({
      where: { userId: user.id },
      defaults: {},
    });
    const [item] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId: product.id },
      defaults: { quantity: 0, unitPrice: 0 },
    });
    const newQty = item.quantity + parseInt(quantity, 10);
    if (product.maxQtyPerOrder && newQty > product.maxQtyPerOrder) {
      throw new ApiError('Exceeds max qty per order', 400);
    }
    if (newQty > product.stock) throw new ApiError('Insufficient stock', 400);
    const price = getEffectivePrice(product);
    item.quantity = newQty;
    item.unitPrice = price;
    item.displayName = product.name;
    item.thumbnailUrl = product.imageUrl;
    item.subtotal = item.quantity * item.unitPrice;
    await item.save();
    const refreshed = await Cart.findByPk(cart.id, {
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    res.json(attachTotal(refreshed));
  } catch (err) {
    next(err);
  }
};

// PATCH /cart/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { id } = req.params;
    const dto = require('./dto');
    const { quantity } = dto.parseUpdateItem(req.body);
    // Ensure the cart item belongs to the authenticated user to prevent
    // tampering with another user's cart by guessing item IDs.
    const item = await CartItem.findOne({
      where: { id },
      include: { model: Cart, where: { userId: user.id } },
    });
    if (!item) throw new ApiError('Cart item not found', 404);
    if (parseInt(quantity, 10) <= 0) {
      await item.destroy();
    } else {
      const product = await Product.findByPk(item.productId);
      if (!product) throw new ApiError('Product not found', 404);
      if (product.status === 'discontinued') throw new ApiError('Product discontinued', 400);
      const newQty = parseInt(quantity, 10);
      if (product.maxQtyPerOrder && newQty > product.maxQtyPerOrder) {
        throw new ApiError('Exceeds max qty per order', 400);
      }
      if (newQty > product.stock) throw new ApiError('Insufficient stock', 400);
      const price = getEffectivePrice(product);
      item.quantity = newQty;
      item.unitPrice = price;
      item.displayName = product.name;
      item.thumbnailUrl = product.imageUrl;
      item.subtotal = item.quantity * item.unitPrice;
      await item.save();
    }
    const cart = await Cart.findOne({
      where: { id: item.cartId, userId: user.id },
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    res.json(attachTotal(cart));
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/items/:id
exports.removeItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { id } = req.params;
    // Fetch the cart item ensuring it belongs to the current user
    const item = await CartItem.findOne({
      where: { id },
      include: { model: Cart, where: { userId: user.id } },
    });
    if (!item) throw new ApiError('Cart item not found', 404);
    const cartId = item.cartId;
    await item.destroy();
    const cart = await Cart.findOne({
      where: { id: cartId, userId: user.id },
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    res.json(attachTotal(cart));
  } catch (err) {
    next(err);
  }
};

// DELETE /cart
exports.clearCart = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const [cart] = await Cart.findOrCreate({
      where: { userId: user.id },
      defaults: {},
    });
    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.couponCode = null;
    cart.discountTotal = 0;
    if (typeof cart.save === 'function') {
      await cart.save();
    }
    const refreshed = await Cart.findByPk(cart.id, {
      include: { model: CartItem, as: 'items', include: [Product] },
    });
    res.json(attachTotal(refreshed));
  } catch (err) {
    next(err);
  }
};

// POST /cart/apply-coupon
exports.applyCoupon = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const codeRaw = (req.body && req.body.code) || '';
    const code = String(codeRaw).trim().toUpperCase();
    if (!code) throw new ApiError('code is required', 400, 'BAD_REQUEST');

    const cart = await Cart.findOrCreate({ where: { userId: user.id }, defaults: {} }).then(([c]) => c);
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: { model: CartItem, as: 'items', include: [{ model: Product, include: [{ model: Category, as: 'categories', through: { attributes: [] } }] }] },
    });
    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon) throw new ApiError('Cupón inválido', 400, 'COUPON_INVALID');

    const { validateAndPriceCoupon } = require('../promotions/engine');
    const result = await validateAndPriceCoupon({ coupon, userId: user.id, cart: cartWithItems, models: require('../../infra/models') });
    if (!result.ok) {
      throw new ApiError(result.message || 'Cupón no aplicable', 400, result.code || 'COUPON_NOT_APPLICABLE');
    }
    cart.couponCode = code;
    cart.discountTotal = result.discount;
    await cart.save();
    const refreshed = await Cart.findByPk(cart.id, {
      include: { model: CartItem, as: 'items' },
    });
    res.json(attachTotal(refreshed));
  } catch (err) {
    next(err);
  }
};

// DELETE /cart/coupon
exports.removeCoupon = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const [cart] = await Cart.findOrCreate({ where: { userId: user.id }, defaults: {} });
    cart.couponCode = null;
    cart.discountTotal = 0;
    await cart.save();
    const refreshed = await Cart.findByPk(cart.id, { include: { model: CartItem, as: 'items', include: [Product] } });
    res.json(attachTotal(refreshed));
  } catch (err) {
    next(err);
  }
};
