// src/modules/wishlist/controller.js
// CRUD handlers for user wishlists. Requires authentication.

const { Wishlist, WishlistItem, Product } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// GET /wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const wishlist = await Wishlist.findOne({
      where: { userId: user.id },
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(wishlist || null);
  } catch (err) {
    next(err);
  }
};

// POST /wishlist/items
exports.addItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const dto = require('./dto');
    const { productId } = dto.parseAddItem(req.body);
    const product = await Product.findByPk(productId);
    if (!product) throw new ApiError('Product not found', 404);
    const [wishlist] = await Wishlist.findOrCreate({
      where: { userId: user.id },
      defaults: {},
    });
    await WishlistItem.findOrCreate({
      where: { wishlistId: wishlist.id, productId: product.id },
      defaults: {},
    });
    const refreshed = await Wishlist.findByPk(wishlist.id, {
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(refreshed);
  } catch (err) {
    next(err);
  }
};

// DELETE /wishlist/items/:id
exports.removeItem = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) throw new ApiError('Not authenticated', 401);
    const { id } = req.params;
    const item = await WishlistItem.findOne({
      where: { id },
      include: { model: Wishlist, where: { userId: user.id } },
    });
    if (!item) throw new ApiError('Wishlist item not found', 404);
    const wishlistId = item.wishlistId;
    await item.destroy();
    const wishlist = await Wishlist.findOne({
      where: { id: wishlistId, userId: user.id },
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};
