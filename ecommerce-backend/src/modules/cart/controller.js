// src/modules/cart/controller.js
// Controller functions for cart routes. Performs CRUD operations on
// Cart and CartItem models. Authentication is required on all actions.

const { Cart, CartItem, Product } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// GET /cart
exports.getCart = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const cart = await Cart.findOne({ where: { userId: user.id }, include: { model: CartItem, include: Product } });
    res.json(cart || null);
  } catch (err) {
    next(err);
  }
};

// POST /cart/items
exports.addItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { productId, quantity } = req.body;
    if (!productId || !quantity) throw new ApiError('productId and quantity are required', 400);
    const product = await Product.findByPk(productId);
    if (!product) throw new ApiError('Product not found', 404);
    const [cart] = await Cart.findOrCreate({ where: { userId: user.id }, defaults: {} });
    const [item] = await CartItem.findOrCreate({ where: { cartId: cart.id, productId: product.id }, defaults: { quantity: 0, unitPrice: product.price } });
    item.quantity += parseInt(quantity, 10);
    item.unitPrice = product.price;
    await item.save();
    const refreshed = await Cart.findByPk(cart.id, { include: { model: CartItem, include: Product } });
    res.json(refreshed);
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
    const { quantity } = req.body;
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
      item.quantity = parseInt(quantity, 10);
      await item.save();
    }
    const cart = await Cart.findOne({ where: { id: item.cartId, userId: user.id }, include: { model: CartItem, include: Product } });
    res.json(cart);
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
      include: { model: CartItem, include: Product },
    });
    res.json(cart);
  } catch (err) {
    next(err);
  }
};