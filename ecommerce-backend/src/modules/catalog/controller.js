// src/modules/catalog/controller.js
// Controller functions for catalog routes. Each function queries the
// Sequelize ORM for data related to products and categories. Filters are
// applied based on query parameters.

const { Op } = require('sequelize');
const { Product, Category, Review, User } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

// GET /products
exports.getProducts = async (req, res, next) => {
  try {
    const { search, theme, minPrice, maxPrice } = req.query;
    const where = {};
    const include = [];
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (theme) {
      include.push({ model: Category, where: { name: { [Op.iLike]: `%${theme}%` } }, through: { attributes: [] } });
    }
    include.push({ model: Category, through: { attributes: [] } });
    include.push({ model: Review, include: [User] });
    const products = await Product.findAll({ where, include });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, through: { attributes: [] } },
        { model: Review, include: [User] },
      ],
    });
    if (!product) throw new ApiError('Product not found', 404);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// GET /categories
exports.getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};