// Centralised model definitions using Sequelize
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

// User model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'customer' },
}, {
  tableName: 'users',
  underscored: true,
});

// Social identity model (OAuth provider identities)
const SocialIdentity = sequelize.define('SocialIdentity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  provider: { type: DataTypes.STRING, allowNull: false },
  providerId: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'social_identities',
  underscored: true,
});

// Refresh token model for secure OAuth sessions
const RefreshToken = sequelize.define('RefreshToken', {
  token: { type: DataTypes.STRING, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  revokedAt: { type: DataTypes.DATE },
}, {
  tableName: 'refresh_tokens',
  underscored: true,
});

// Idempotency key model to deduplicate requests
const IdempotencyKey = sequelize.define('IdempotencyKey', {
  key: { type: DataTypes.STRING, primaryKey: true },
  endpoint: { type: DataTypes.STRING, allowNull: false },
  refId: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER },
}, {
  tableName: 'idempotency_keys',
  underscored: true,
});

// Address model
const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  street: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'addresses',
  underscored: true,
});

// Wishlist model
const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Explicit foreign key mapping to ensure camelCase attribute uses snake_case column
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
}, {
  tableName: 'wishlists',
  underscored: true,
});

// WishlistItem bridging table (many-to-many between Wishlist and Product)
// Explicit FK fields so camelCase attributes map to snake_case columns
const WishlistItem = sequelize.define('WishlistItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  wishlistId: { type: DataTypes.INTEGER, allowNull: false, field: 'wishlist_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
}, {
  tableName: 'wishlist_items',
  underscored: true,
});

// Product model
const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  // identity
  slug: { type: DataTypes.STRING, unique: true },
  setNumber: { type: DataTypes.STRING, unique: true, field: 'set_number' },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), allowNull: false },
  imageUrl: { type: DataTypes.STRING },
  instructionsUrl: { type: DataTypes.STRING, field: 'instructions_url' },
  recommendedAgeMin: { type: DataTypes.INTEGER, field: 'recommended_age_min' },
  recommendedAgeMax: { type: DataTypes.INTEGER, field: 'recommended_age_max' },
  // construction
  pieceCount: { type: DataTypes.INTEGER, field: 'piece_count', defaultValue: 0 },
  minifigCount: { type: DataTypes.INTEGER, field: 'minifig_count', defaultValue: 0 },
  // logistics
  weightGrams: { type: DataTypes.INTEGER, field: 'weight_grams' },
  boxWidthMm: { type: DataTypes.INTEGER, field: 'box_width_mm' },
  boxHeightMm: { type: DataTypes.INTEGER, field: 'box_height_mm' },
  boxDepthMm: { type: DataTypes.INTEGER, field: 'box_depth_mm' },
  // commercial
  releaseYear: { type: DataTypes.INTEGER, field: 'release_year' },
  retiredYear: { type: DataTypes.INTEGER, field: 'retired_year' },
  // pricing
  msrp: { type: DataTypes.DECIMAL(10,2) },
  isNew: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isOnSale: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  maxQtyPerOrder: { type: DataTypes.INTEGER, field: 'max_qty_per_order' },
  // coupons eligibility
  allowCoupon: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allow_coupon' },
}, {
  tableName: 'products',
  underscored: true,
  indexes: [
    { fields: ['code'] },
    { fields: ['status'] },
    { fields: ['price'] },
    { unique: true, fields: ['slug'] },
    { unique: true, fields: ['set_number'] },
  ],
});

// Category model
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'categories',
  underscored: true,
});

// ProductCategory bridging table (many-to-many between Product and Category)
const ProductCategory = sequelize.define('ProductCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
  tableName: 'product_categories',
  underscored: true,
});

// Cart model
const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Explicit foreign key so queries use snake_case column
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  // Applied coupon snapshot on cart
  couponCode: { type: DataTypes.STRING, field: 'coupon_code' },
  discountTotal: { type: DataTypes.DECIMAL(10,2), field: 'discount_total', defaultValue: 0 },
}, {
  tableName: 'carts',
  underscored: true,
});

// CartItem model
const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Explicit FK fields so camelCase attributes map to snake_case columns
  cartId: { type: DataTypes.INTEGER, allowNull: false, field: 'cart_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2) },
  displayName: { type: DataTypes.STRING, field: 'display_name' },
  thumbnailUrl: { type: DataTypes.STRING, field: 'thumbnail_url' },
}, {
  tableName: 'cart_items',
  underscored: true,
});

// Order model (enhanced for OMS)
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Core order status lifecycle: pending|paid|picking|shipped|delivered|canceled|refunded
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
  // Commercial totals
  subtotal: { type: DataTypes.DECIMAL(10,2) },
  discountTotal: { type: DataTypes.DECIMAL(10,2), field: 'discount_total' },
  shippingTotal: { type: DataTypes.DECIMAL(10,2), field: 'shipping_total' },
  taxTotal: { type: DataTypes.DECIMAL(10,2), field: 'tax_total' },
  grandTotal: { type: DataTypes.DECIMAL(10,2), field: 'grand_total' },
  currency: { type: DataTypes.STRING(3) },
  // Backward compatibility: keep a total column mirroring grandTotal
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  // Payment audit on order
  paymentStatus: { type: DataTypes.STRING, field: 'payment_status' }, // pending|approved|rejected|refunded|chargeback
  paymentProvider: { type: DataTypes.STRING, field: 'payment_provider' },
  paymentId: { type: DataTypes.STRING, field: 'payment_id' },
  paymentRaw: { type: DataTypes.JSON, field: 'payment_raw' },
  // Shipping
  shippingMethod: { type: DataTypes.STRING, field: 'shipping_method' },
  shippingAddress: { type: DataTypes.JSON, field: 'shipping_address' },
  billingAddress: { type: DataTypes.JSON, field: 'billing_address' },
  // Coupons and notes
  couponCode: { type: DataTypes.STRING, field: 'coupon_code' },
  notesAdmin: { type: DataTypes.TEXT, field: 'notes_admin' },
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ],
});

// OrderItem model with snapshot fields
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Explicit FK fields so camelCase attributes map to snake_case columns
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  // Snapshot for display
  displayName: { type: DataTypes.STRING, field: 'display_name' },
  thumbnailUrl: { type: DataTypes.STRING, field: 'thumbnail_url' },
  currency: { type: DataTypes.STRING(3) },
  lineSubtotal: { type: DataTypes.DECIMAL(10,2), field: 'line_subtotal' },
}, {
  tableName: 'order_items',
  underscored: true,
  indexes: [{ fields: ['order_id'] }],
});

// Payment model
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  provider: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  externalId: { type: DataTypes.STRING }, // id from MP or other providers
  rawPayload: { type: DataTypes.JSON },
}, {
  tableName: 'payments',
  underscored: true,
});

// Shipment model
const Shipment = sequelize.define('Shipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  carrier: { type: DataTypes.STRING },
  tracking: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
}, {
  tableName: 'shipments',
  underscored: true,
});

// Coupon model (promotions)
const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true }, // uppercase enforced at DTO level
  type: { type: DataTypes.STRING, allowNull: false }, // 'percent' | 'fixed' (accept legacy 'percentage')
  value: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  validFrom: { type: DataTypes.DATE, field: 'valid_from' },
  validTo: { type: DataTypes.DATE, field: 'valid_to' },
  minSubtotal: { type: DataTypes.DECIMAL(10,2), field: 'min_subtotal', defaultValue: 0 },
  maxUses: { type: DataTypes.INTEGER, field: 'max_uses' },
  perUserLimit: { type: DataTypes.INTEGER, field: 'per_user_limit' },
  allowedThemes: { type: DataTypes.JSON, field: 'allowed_themes' }, // array of category names
  disallowProducts: { type: DataTypes.JSON, field: 'disallow_products' }, // array of product ids or codes
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' }, // 'active' | 'paused'
  stackable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  createdBy: { type: DataTypes.INTEGER, field: 'created_by' },
}, {
  tableName: 'coupons',
  underscored: true,
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['status'] },
    { fields: ['valid_from'] },
    { fields: ['valid_to'] },
  ],
});

// CouponUsage model
const CouponUsage = sequelize.define('CouponUsage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  couponId: { type: DataTypes.INTEGER, allowNull: false, field: 'coupon_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  orderId: { type: DataTypes.INTEGER, allowNull: false, field: 'order_id' },
  usedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'used_at' },
}, {
  tableName: 'coupon_usages',
  underscored: true,
  indexes: [
    { fields: ['coupon_id'] },
    { fields: ['user_id'] },
    { fields: ['order_id'] },
  ],
});

// Review model
const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.SMALLINT, allowNull: false },
  comment: { type: DataTypes.TEXT },
}, {
  tableName: 'reviews',
  underscored: true,
});

// Product media (multiple images, instructions, etc)
const ProductMedia = sequelize.define('ProductMedia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  url: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING },
}, {
  tableName: 'product_media',
  underscored: true,
  indexes: [{ fields: ['product_id'] }],
});

// Product price history
const ProductPriceHistory = sequelize.define('ProductPriceHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  recordedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'recorded_at' },
}, {
  tableName: 'product_price_history',
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['recorded_at'] },
  ],
});

// Order status history
const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  from: { type: DataTypes.STRING },
  to: { type: DataTypes.STRING },
  changedBy: { type: DataTypes.INTEGER, field: 'changed_by' },
  note: { type: DataTypes.TEXT },
}, {
  tableName: 'order_status_history',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['order_id'] }],
});

// Payment events (webhook/audit trail)
const PaymentEvent = sequelize.define('PaymentEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING }, // webhook|refund|capture
  payload: { type: DataTypes.JSON },
}, {
  tableName: 'payment_events',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [{ fields: ['payment_id'] }],
});

/*
 * Associations
 */
// User relations
User.hasMany(Address, { as: 'addresses' });
Address.belongsTo(User);

User.hasMany(SocialIdentity, { as: 'socialIdentities' });
SocialIdentity.belongsTo(User);

User.hasMany(RefreshToken, { as: 'refreshTokens' });
RefreshToken.belongsTo(User);

User.hasMany(IdempotencyKey, { as: 'idempotencyKeys' });
IdempotencyKey.belongsTo(User);

User.hasMany(Wishlist, { as: 'wishlists', foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Cart, { as: 'carts', foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { as: 'orders' });
Order.belongsTo(User);

User.hasMany(Review, { as: 'reviews' });
Review.belongsTo(User);

// Wishlist relations
Wishlist.belongsToMany(Product, {
  through: WishlistItem,
  as: 'products',
  foreignKey: 'wishlistId',
  otherKey: 'productId',
});
Product.belongsToMany(Wishlist, {
  through: WishlistItem,
  as: 'wishlists',
  foreignKey: 'productId',
  otherKey: 'wishlistId',
});
Wishlist.hasMany(WishlistItem, { as: 'items', foreignKey: 'wishlistId' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlistId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

// Product and Category (N:M)
Product.belongsToMany(Category, { through: ProductCategory, as: 'categories' });
Category.belongsToMany(Product, { through: ProductCategory, as: 'products' });

// Cart relations
Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Product.hasMany(CartItem, { as: 'cartItems', foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// Order relations
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasOne(Payment, { as: 'payment' });
Payment.belongsTo(Order);

Order.hasMany(OrderStatusHistory, { as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order);

Payment.hasMany(PaymentEvent, { as: 'events' });
PaymentEvent.belongsTo(Payment);

Order.hasOne(Shipment, { as: 'shipment' });
Shipment.belongsTo(Order);

Order.belongsTo(Coupon, { as: 'coupon' });
Coupon.hasMany(Order);

// Coupon usage relations
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });
Coupon.hasMany(CouponUsage, { as: 'usages', foreignKey: 'couponId' });
CouponUsage.belongsTo(User, { foreignKey: 'userId' });
CouponUsage.belongsTo(Order, { foreignKey: 'orderId' });

// Review relations
Product.hasMany(Review, { as: 'reviews' });
Review.belongsTo(Product);

// Product media relations
Product.hasMany(ProductMedia, { as: 'media', foreignKey: 'productId' });
ProductMedia.belongsTo(Product, { foreignKey: 'productId' });

// Product price history relations
Product.hasMany(ProductPriceHistory, { as: 'priceHistory', foreignKey: 'productId' });
ProductPriceHistory.belongsTo(Product, { foreignKey: 'productId' });

// Hooks to record price history
Product.addHook('afterCreate', async (product, options) => {
  const entries = [];
  if (product.msrp != null) entries.push({ productId: product.id, price: product.msrp });
  if (product.price != null) entries.push({ productId: product.id, price: product.price });
  if (entries.length) {
    await ProductPriceHistory.bulkCreate(entries, { transaction: options.transaction });
  }
});

Product.addHook('afterUpdate', async (product, options) => {
  const entries = [];
  if (product.previous('msrp') !== product.msrp) {
    entries.push({ productId: product.id, price: product.msrp });
  }
  if (product.previous('price') !== product.price) {
    entries.push({ productId: product.id, price: product.price });
  }
  const saleWindowChanged =
    product.previous('saleStart') !== product.saleStart ||
    product.previous('saleEnd') !== product.saleEnd;
  if (saleWindowChanged && product.price != null) {
    entries.push({ productId: product.id, price: product.price });
  }
  if (entries.length) {
    await ProductPriceHistory.bulkCreate(entries, { transaction: options.transaction });
  }
});

// Export models and sync helper
module.exports = {
  sequelize,
  User,
  SocialIdentity,
  Address,
  Wishlist,
  WishlistItem,
  Product,
  Category,
  ProductCategory,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Coupon,
  CouponUsage,
  Review,
  RefreshToken,
  IdempotencyKey,
  ProductMedia,
  ProductPriceHistory,
  OrderStatusHistory,
  PaymentEvent,
};
