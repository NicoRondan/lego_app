const { Op } = require('sequelize');

function normalizeType(type) {
  if (!type) return null;
  const t = String(type).toLowerCase();
  if (t === 'percentage') return 'percent';
  if (t === 'percent' || t === 'fixed') return t;
  return t;
}

// Banker's rounding to given decimals
function roundBankers(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  // Convert to integer base for rounding
  const n = value * factor;
  const floor = Math.floor(n);
  const diff = n - floor;
  if (diff > 0.5) return Math.round(n) / factor;
  if (diff < 0.5) return floor / factor;
  // exactly .5 -> round to even
  return (floor % 2 === 0 ? floor : floor + 1) / factor;
}

async function countUsage(models, couponId, userId) {
  const { CouponUsage } = models;
  const total = await CouponUsage.count({ where: { couponId } });
  const byUser = await CouponUsage.count({ where: { couponId, userId } });
  return { total, byUser };
}

function extractCartItems(cart) {
  const items = cart.items || cart.CartItems || [];
  return items.map((it) => ({
    productId: it.productId || it.Product?.id,
    quantity: it.quantity,
    unitPrice: parseFloat(it.unitPrice),
    product: it.Product || null,
  }));
}

function computeSubtotal(items) {
  return items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
}

function hasAnyAllowedTheme(items, allowedThemes) {
  if (!Array.isArray(allowedThemes) || allowedThemes.length === 0) return true;
  for (const it of items) {
    const cats = it.product?.categories || it.product?.Categories || [];
    if (cats.some((c) => allowedThemes.includes(c.name))) {
      return true;
    }
  }
  return false;
}

function hasDisallowedProducts(items, disallowProducts) {
  if (!Array.isArray(disallowProducts) || disallowProducts.length === 0) return false;
  const disallowSet = new Set(disallowProducts.map((v) => String(v)));
  return items.some((it) => disallowSet.has(String(it.productId)) || disallowSet.has(String(it.product?.code)));
}

function allItemsAllowCoupons(items) {
  return items.every((it) => it.product?.allowCoupon !== false);
}

async function validateAndPriceCoupon({ coupon, userId, cart, models, nowUtc = new Date() }) {
  const type = normalizeType(coupon.type);
  if (coupon.status && coupon.status !== 'active') {
    return { ok: false, code: 'COUPON_INVALID', message: 'Cupón no activo' };
  }
  if (coupon.validFrom && nowUtc < new Date(coupon.validFrom)) {
    return { ok: false, code: 'COUPON_EXPIRED', message: 'Cupón aún no válido' };
  }
  if (coupon.validTo && nowUtc > new Date(coupon.validTo)) {
    return { ok: false, code: 'COUPON_EXPIRED', message: 'Cupón expirado' };
  }

  const { total, byUser } = await countUsage(models, coupon.id, userId);
  if (coupon.maxUses != null && total >= coupon.maxUses) {
    return { ok: false, code: 'COUPON_LIMIT_REACHED', message: 'Límite de usos alcanzado' };
  }
  if (coupon.perUserLimit != null && byUser >= coupon.perUserLimit) {
    return { ok: false, code: 'COUPON_LIMIT_REACHED', message: 'Límite por usuario alcanzado' };
  }

  const items = extractCartItems(cart);
  if (items.length === 0) return { ok: false, code: 'COUPON_NOT_APPLICABLE', message: 'Carrito vacío' };
  const subtotal = computeSubtotal(items);
  if (coupon.minSubtotal && subtotal < parseFloat(coupon.minSubtotal)) {
    return { ok: false, code: 'COUPON_MIN_SUBTOTAL', message: 'Subtotal mínimo no alcanzado' };
  }
  if (!allItemsAllowCoupons(items)) {
    return { ok: false, code: 'COUPON_NOT_APPLICABLE', message: 'Algunos productos no aceptan cupones' };
  }
  if (hasDisallowedProducts(items, coupon.disallowProducts)) {
    return { ok: false, code: 'COUPON_NOT_APPLICABLE', message: 'Carrito contiene productos no elegibles' };
  }
  if (!hasAnyAllowedTheme(items, coupon.allowedThemes || [])) {
    return { ok: false, code: 'COUPON_NOT_APPLICABLE', message: 'No hay items del tema permitido' };
  }

  // Price
  let discount = 0;
  if (type === 'fixed') {
    discount = Math.min(subtotal, parseFloat(coupon.value));
  } else if (type === 'percent') {
    const pct = parseFloat(coupon.value) / 100;
    discount = subtotal * pct;
  } else {
    return { ok: false, code: 'COUPON_INVALID', message: 'Tipo de cupón no soportado' };
  }
  discount = roundBankers(discount, 2);
  const grand = roundBankers(subtotal - discount, 2);
  return {
    ok: true,
    subtotal,
    discount,
    grandTotal: grand,
  };
}

module.exports = {
  normalizeType,
  roundBankers,
  validateAndPriceCoupon,
};

