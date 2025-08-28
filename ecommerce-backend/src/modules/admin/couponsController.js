const { Op } = require('sequelize');
const { Coupon, CouponUsage, User } = require('../../infra/models');
const { ApiError } = require('../../shared/errors');

function parseCouponBody(body, { isUpdate = false } = {}) {
  const {
    code,
    type,
    value,
    validFrom,
    validTo,
    minSubtotal,
    maxUses,
    perUserLimit,
    allowedThemes,
    disallowProducts,
    status,
    stackable,
  } = body;
  const data = {};
  if (!isUpdate) {
    if (!code) throw new ApiError('code is required', 400);
    data.code = String(code).trim().toUpperCase();
  } else if (code !== undefined) {
    data.code = String(code).trim().toUpperCase();
  }
  if (!isUpdate || type !== undefined) {
    if (!type) throw new ApiError('type is required', 400);
    const t = String(type).toLowerCase();
    if (!['percent', 'percentage', 'fixed'].includes(t)) {
      throw new ApiError('type must be percent or fixed', 400);
    }
    data.type = t === 'percentage' ? 'percent' : t;
  }
  if (!isUpdate || value !== undefined) {
    const v = parseFloat(value);
    if (isNaN(v) || v < 0) throw new ApiError('value must be a non-negative number', 400);
    data.value = v;
  }
  if (validFrom !== undefined) data.validFrom = validFrom ? new Date(validFrom) : null;
  if (validTo !== undefined) data.validTo = validTo ? new Date(validTo) : null;
  if (minSubtotal !== undefined) {
    const m = parseFloat(minSubtotal);
    if (isNaN(m) || m < 0) throw new ApiError('minSubtotal must be >= 0', 400);
    data.minSubtotal = m;
  }
  if (maxUses !== undefined) {
    const m = parseInt(maxUses, 10);
    if (isNaN(m) || m < 0) throw new ApiError('maxUses must be >= 0', 400);
    data.maxUses = m;
  }
  if (perUserLimit !== undefined) {
    const m = parseInt(perUserLimit, 10);
    if (isNaN(m) || m < 0) throw new ApiError('perUserLimit must be >= 0', 400);
    data.perUserLimit = m;
  }
  if (allowedThemes !== undefined) {
    if (allowedThemes === null || allowedThemes === '') {
      data.allowedThemes = null;
    } else if (Array.isArray(allowedThemes)) {
      data.allowedThemes = allowedThemes.map((s) => String(s));
    } else if (typeof allowedThemes === 'string') {
      data.allowedThemes = allowedThemes.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      throw new ApiError('allowedThemes must be array or comma-separated string', 400);
    }
  }
  if (disallowProducts !== undefined) {
    if (disallowProducts === null || disallowProducts === '') {
      data.disallowProducts = null;
    } else if (Array.isArray(disallowProducts)) {
      data.disallowProducts = disallowProducts.map((s) => String(s));
    } else if (typeof disallowProducts === 'string') {
      data.disallowProducts = disallowProducts.split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      throw new ApiError('disallowProducts must be array or comma-separated string', 400);
    }
  }
  if (status !== undefined) {
    const st = String(status);
    if (!['active', 'paused'].includes(st)) throw new ApiError('status must be active|paused', 400);
    data.status = st;
  }
  if (stackable !== undefined) data.stackable = !!stackable;
  return data;
}

// POST /admin/coupons
exports.createCoupon = async (req, res, next) => {
  try {
    const data = parseCouponBody(req.body);
    data.createdBy = req.user?.id || null;
    const record = await Coupon.create(data);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// PUT /admin/coupons/:id
exports.updateCoupon = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError('Invalid id', 400);
    const coupon = await Coupon.findByPk(id);
    if (!coupon) throw new ApiError('Coupon not found', 404);
    const data = parseCouponBody(req.body, { isUpdate: true });
    await coupon.update(data);
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

// GET /admin/coupons?q=&status=&page=
exports.listCoupons = async (req, res, next) => {
  try {
    const { q = '', status = '', page = 1, pageSize = 20 } = req.query || {};
    const where = {};
    if (q) where.code = { [Op.like]: `%${String(q).toUpperCase()}%` };
    if (status) where.status = String(status);
    const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
    const offset = ((parseInt(page, 10) || 1) - 1) * limit;
    const { rows, count } = await Coupon.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });
    // Attach usage count for display
    const withUsage = await Promise.all(rows.map(async (c) => {
      const usageCount = await CouponUsage.count({ where: { couponId: c.id } });
      return { ...c.toJSON(), usageCount };
    }));
    res.json({ items: withUsage, total: count, page: parseInt(page, 10) || 1, pageSize: limit });
  } catch (err) {
    next(err);
  }
};

// GET /admin/coupons/:id/usages
exports.listCouponUsages = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError('Invalid id', 400);
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize, 10) || 20, 100);
    const offset = (page - 1) * pageSize;
    const { rows, count } = await CouponUsage.findAndCountAll({
      where: { couponId: id },
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      limit: pageSize,
      offset,
      order: [['usedAt', 'DESC']],
    });
    res.json({ items: rows, total: count, page, pageSize });
  } catch (err) {
    next(err);
  }
};

