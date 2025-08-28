// src/modules/catalog/controller.js
// Controller functions for catalog routes. Each function queries the
// Sequelize ORM for data related to products and categories. Filters are
// applied based on query parameters.

const { Op, fn, col, where: sequelizeWhere } = require('sequelize');
const { Product, Category, Review, User, Inventory } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');
const { logger } = require('../../shared/logger');

// Helper to enrich product responses with derived fields
function serializeProduct(product) {
  const plain = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const msrp = plain.msrp != null ? parseFloat(plain.msrp) : null;
  const salePrice = plain.price != null ? parseFloat(plain.price) : null;
  const priceEffective = salePrice != null ? salePrice : msrp;
  const isOnSale =
    salePrice != null && msrp != null ? salePrice < msrp : !!plain.isOnSale;
  const currentYear = new Date().getFullYear();
  const isNew =
    plain.isNew || (plain.releaseYear && plain.releaseYear >= currentYear - 1);
  return {
    ...plain,
    msrp,
    salePrice,
    priceEffective,
    isOnSale,
    isNew,
    primaryImageUrl: plain.imageUrl,
  };
}

// POST /products
exports.createProduct = async (req, res, next) => {
  const log = req.log || logger;
  try {
    log.info({ body: req.body }, 'Creating product');
    const dto = require('./dto');
    const data = dto.parseCreateProduct(req.body);
    const { categories = [], ...productData } = data;
    const product = await Product.create(productData);
    // Initialize inventory row mirroring initial stock
    try {
      await Inventory.findOrCreate({ where: { productId: product.id }, defaults: { stock: product.stock, safetyStock: 0, reserved: 0 } });
    } catch (_) { /* non-blocking */ }
    if (categories.length) {
      const cats = [];
      for (const name of categories) {
        const [cat] = await Category.findOrCreate({ where: { name } });
        cats.push(cat);
      }
      await product.setCategories(cats);
    }
    log.info({ id: product.id }, 'Product created');
    res.status(201).json(product);
  } catch (err) {
    log.error({ err }, 'Error creating product');
    next(err);
  }
};

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
      slug,
      setNumber,
      minPieces,
      maxPieces,
      ageMin,
      ageMax,
      status,
      visibility,
      isOnSale,
      isNew,
      page = 1,
      limit = 10,
      order = 'price_asc',
    } = dto.parseGetProducts(req.query);

    const where = {};
    const include = [];
    const dialect = Product.sequelize ? Product.sequelize.getDialect() : 'sqlite';

    if (search) {
      const searchPattern = `%${search}%`;
      if (dialect === 'sqlite') {
        const lowerPattern = `%${search.toLowerCase()}%`;
        where[Op.or] = [
          sequelizeWhere(fn('lower', col('Product.name')), { [Op.like]: lowerPattern }),
          sequelizeWhere(fn('lower', col('Product.description')), { [Op.like]: lowerPattern }),
        ];
      } else {
        const likeOp = dialect === 'postgres' ? Op.iLike : Op.like;
        where[Op.or] = [
          { name: { [likeOp]: searchPattern } },
          { description: { [likeOp]: searchPattern } },
        ];
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (slug) where.slug = slug;
    if (setNumber) where.setNumber = setNumber;

    if (minPieces !== undefined || maxPieces !== undefined) {
      where.pieceCount = {};
      if (minPieces !== undefined) where.pieceCount[Op.gte] = minPieces;
      if (maxPieces !== undefined) where.pieceCount[Op.lte] = maxPieces;
    }

    if (ageMin !== undefined || ageMax !== undefined) {
      const currentYear = new Date().getFullYear();
      where.releaseYear = where.releaseYear || {};
      if (ageMin !== undefined)
        where.releaseYear[Op.lte] = currentYear - ageMin;
      if (ageMax !== undefined)
        where.releaseYear[Op.gte] = currentYear - ageMax;
    }

    if (status) where.status = status;
    if (visibility && Product.rawAttributes.visibility) where.visibility = visibility;
    if (typeof isOnSale === 'boolean') where.isOnSale = isOnSale;
    if (typeof isNew === 'boolean') where.isNew = isNew;

    if (theme) {
      const themePattern = `%${theme}%`;
      let categoryWhere;
      if (dialect === 'sqlite') {
        categoryWhere = sequelizeWhere(
          fn('lower', col('categories.name')),
          { [Op.like]: `%${theme.toLowerCase()}%` }
        );
      } else {
        const likeOp = dialect === 'postgres' ? Op.iLike : Op.like;
        categoryWhere = { name: { [likeOp]: themePattern } };
      }
      include.push({
        model: Category,
        as: 'categories',
        where: categoryWhere,
        through: { attributes: [] },
      });
    } else {
      include.push({ model: Category, as: 'categories', through: { attributes: [] } });
    }
    include.push({ model: Review, as: 'reviews', include: [{ model: User, attributes: ['id', 'name'] }] });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    let orderBy = [];
    switch (order) {
      case 'price_desc':
        orderBy = [['price', 'DESC']];
        break;
      case 'price_asc':
        orderBy = [['price', 'ASC']];
        break;
      case 'msrp_desc':
        orderBy = [['msrp', 'DESC']];
        break;
      case 'msrp_asc':
        orderBy = [['msrp', 'ASC']];
        break;
      case 'newest':
        orderBy = [['releaseYear', 'DESC']];
        break;
      case 'oldest':
        orderBy = [['releaseYear', 'ASC']];
        break;
      case 'name_desc':
        orderBy = [['name', 'DESC']];
        break;
      case 'name_asc':
        orderBy = [['name', 'ASC']];
        break;
      case 'pieces_desc':
        orderBy = [['pieceCount', 'DESC']];
        break;
      case 'pieces_asc':
        orderBy = [['pieceCount', 'ASC']];
        break;
      default:
        orderBy = [['id', 'ASC']];
        break;
    }

    const result = await Product.findAndCountAll({
      where,
      include,
      limit: limitNum,
      offset,
      order: orderBy,
      distinct: true,
    });

      const items = result.rows.map(serializeProduct);

      // simple facet counts based on returned items
      const facets = { status: {}, visibility: {}, isOnSale: {}, isNew: {} };
      for (const p of items) {
        if (p.status) facets.status[p.status] = (facets.status[p.status] || 0) + 1;
        if (p.visibility)
          facets.visibility[p.visibility] = (facets.visibility[p.visibility] || 0) + 1;
        facets.isOnSale[p.isOnSale ? 'true' : 'false'] =
          (facets.isOnSale[p.isOnSale ? 'true' : 'false'] || 0) + 1;
        facets.isNew[p.isNew ? 'true' : 'false'] =
          (facets.isNew[p.isNew ? 'true' : 'false'] || 0) + 1;
      }

      log.info({ total: result.count }, 'Products fetched');
      res.json({
        total: result.count,
        limit: limitNum,
        page: pageNum,
        items,
        facets,
      });
    } catch (err) {
      log.error({ err }, 'Error fetching products');
      next(err);
    }
  };

// GET /products/:idOrSlug
exports.getProductById = async (req, res, next) => {
  const log = req.log || logger;
  try {
    const { idOrSlug } = req.params;
    log.info({ idOrSlug }, 'Fetching product');
    const whereClause = /^\d+$/.test(idOrSlug)
      ? { id: parseInt(idOrSlug, 10) }
      : { slug: idOrSlug };
    const product = await Product.findOne({
      where: whereClause,
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Review, as: 'reviews', include: [{ model: User, attributes: ['id', 'name'] }] },
      ],
    });
    if (!product) throw new ApiError('Product not found', 404);
    log.info({ idOrSlug }, 'Product fetched');
    res.json(serializeProduct(product));
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
