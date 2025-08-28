// src/modules/me/wishlistController.js
// Handlers for managing a user's wishlists and items under /me/*

const { Wishlist, WishlistItem, Product, sequelize } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

function requireUser(req) {
  if (!req.user) throw new ApiError('Not authenticated', 401);
  return req.user;
}

async function getOrCreateDefaultWishlist(userId, transaction) {
  let wl = await Wishlist.findOne({ where: { userId, isDefault: true }, transaction });
  if (!wl) {
    // Create a default wishlist if none exists yet
    [wl] = await Wishlist.findOrCreate({
      where: { userId, name: 'Mi lista' },
      defaults: { isDefault: true },
      transaction,
    });
    // Ensure it is default
    if (!wl.isDefault) {
      wl.isDefault = true;
      await wl.save({ transaction });
    }
  }
  return wl;
}

exports.listWishlists = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const lists = await Wishlist.findAll({
      where: { userId: user.id },
      order: [['isDefault', 'DESC'], ['id', 'ASC']],
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(lists);
  } catch (err) { next(err); }
};

exports.getDefaultWishlist = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const wl = await Wishlist.findOne({
      where: { userId: user.id, isDefault: true },
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(wl || null);
  } catch (err) { next(err); }
};

exports.createWishlist = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const user = requireUser(req);
    const name = (req.body?.name || 'Mi lista').toString().trim().slice(0, 120);
    let isDefault = Boolean(req.body?.isDefault);
    // If user has no lists yet, force default
    const existingCount = await Wishlist.count({ where: { userId: user.id }, transaction: t });
    if (existingCount === 0) isDefault = true;

    // If marking as default, unset previous default
    if (isDefault) {
      await Wishlist.update({ isDefault: false }, { where: { userId: user.id }, transaction: t });
    }

    const wl = await Wishlist.create({ userId: user.id, name, isDefault }, { transaction: t });
    await t.commit();
    const full = await Wishlist.findByPk(wl.id, { include: { model: WishlistItem, as: 'items', include: [Product] } });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.deleteWishlist = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const user = requireUser(req);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError('Invalid id', 400);
    const wl = await Wishlist.findOne({ where: { id, userId: user.id }, transaction: t });
    if (!wl) throw new ApiError('Wishlist not found', 404);
    await WishlistItem.destroy({ where: { wishlistId: wl.id }, transaction: t });
    await wl.destroy({ transaction: t });
    await t.commit();
    res.status(204).end();
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.addItem = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const user = requireUser(req);
    const wishlistId = req.body?.wishlistId ? parseInt(req.body.wishlistId, 10) : null;
    const productId = parseInt(req.body?.productId, 10);
    if (isNaN(productId)) throw new ApiError('productId is required', 400);
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) throw new ApiError('Product not found', 404);
    let wl;
    if (wishlistId) {
      wl = await Wishlist.findOne({ where: { id: wishlistId, userId: user.id }, transaction: t });
      if (!wl) throw new ApiError('Wishlist not found', 404);
    } else {
      wl = await getOrCreateDefaultWishlist(user.id, t);
    }
    await WishlistItem.findOrCreate({
      where: { wishlistId: wl.id, productId: product.id },
      defaults: { addedAt: new Date() },
      transaction: t,
    });
    await t.commit();
    const refreshed = await Wishlist.findByPk(wl.id, {
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(refreshed);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const user = requireUser(req);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError('Invalid id', 400);
    const item = await WishlistItem.findOne({
      where: { id },
      include: { model: Wishlist, where: { userId: user.id } },
      transaction: t,
    });
    if (!item) throw new ApiError('Wishlist item not found', 404);
    const wishlistId = item.wishlistId;
    await item.destroy({ transaction: t });
    await t.commit();
    const wl = await Wishlist.findOne({
      where: { id: wishlistId, userId: user.id },
      include: { model: WishlistItem, as: 'items', include: [Product] },
    });
    res.json(wl);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

