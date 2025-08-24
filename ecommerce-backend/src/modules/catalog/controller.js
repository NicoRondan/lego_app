// src/modules/catalog/controller.js
// Controller functions for catalog routes. Each function queries the
// Sequelize ORM for data related to products and categories. Filters are
// applied based on query parameters.

const { Op } = require('sequelize');
const { Product, Category, Review, User } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const { logger } = require('../../shared/logger');

// GET /products
exports.getProducts = async (req, res, next) => {
  const log = req.log || logger;
  try {
    log.info({ query: req.query }, 'Fetching products');
    const dto = require('./dto');
    const {
      search,
      theme,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      order = 'price_asc',
    } = dto.parseGetProducts(req.query);

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
      include.push({
        model: Category,
        where: { name: { [Op.iLike]: `%${theme}%` } },
        through: { attributes: [] },
      });
    }

    include.push({ model: Category, through: { attributes: [] } });
    include.push({ model: Review, include: [User] });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let orderBy = [];
    if (order === 'price_desc') orderBy = [['price', 'DESC']];
    else if (order === 'price_asc') orderBy = [['price', 'ASC']];
    else orderBy = [['id', 'ASC']];

    const result = await Product.findAndCountAll({
      where,
      include,
      limit: limitNum,
      offset,
      order: orderBy,
      distinct: true,
    });

      log.info({ total: result.count }, 'Products fetched');
      res.json({
        total: result.count,
        limit: limitNum,
        page: pageNum,
        items: result.rows,
      });
    } catch (err) {
      log.error({ err }, 'Error fetching products');
      next(err);
    }
  };

// GET /products/:id
exports.getProductById = async (req, res, next) => {
  const log = req.log || logger;
  try {
    const { id } = req.params;
    log.info({ id }, 'Fetching product by id');
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, through: { attributes: [] } },
        { model: Review, include: [User] },
      ],
    });
    if (!product) throw new ApiError('Product not found', 404);
    log.info({ id }, 'Product fetched');
    res.json(product);
  } catch (err) {
    log.error({ err }, 'Error fetching product by id');
    next(err);
  }
};

// GET /categories
exports.getCategories = async (req, res, next) => {
  const log = req.log || logger;
  try {
    log.info('Fetching categories');
    const categories = await Category.findAll();
    log.info({ count: categories.length }, 'Categories fetched');
    res.json(categories);
  } catch (err) {
    log.error({ err }, 'Error fetching categories');
    next(err);
  }
};