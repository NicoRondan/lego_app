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
  phone: { type: DataTypes.STRING },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
  marketingOptIn: { type: DataTypes.BOOLEAN, field: 'marketing_opt_in', defaultValue: false },
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

// Address model (expanded to support shipping/billing profiles)
const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // legacy fields kept for GraphQL compatibility
  street: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  // new fields per spec
  type: { type: DataTypes.ENUM('shipping', 'billing'), allowNull: true },
  name: { type: DataTypes.STRING },
  line1: { type: DataTypes.STRING },
  line2: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  zip: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  isDefault: { type: DataTypes.BOOLEAN, field: 'is_default', defaultValue: false },
}, {
  tableName: 'addresses',
  underscored: true,
});

// Basic user activity/telemetry
const UserEvent = sequelize.define('UserEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  type: { type: DataTypes.STRING, allowNull: false },
  payload: { type: DataTypes.JSON },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
}, {
  tableName: 'user_events',
  underscored: true,
  updatedAt: false,
});

// Wishlist model
const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // Explicit foreign key mapping to ensure camelCase attribute uses snake_case column
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  name: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Mi lista' },
  isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_default' },
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
  addedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'added_at' },
}, {
  tableName: 'wishlist_items',
  underscored: true,
  indexes: [
    { unique: true, fields: ['wishlist_id', 'product_id'] },
  ],
});

// Admin users and RBAC models
const AdminUser = sequelize.define('AdminUser', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('superadmin','catalog_manager','oms','support','marketing'), allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
  isActive: { type: DataTypes.BOOLEAN, field: 'is_active', defaultValue: true },
}, {
  tableName: 'admin_users',
  underscored: true,
});

const AdminUserSession = sequelize.define('AdminUserSession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  adminUserId: { type: DataTypes.INTEGER, allowNull: false, field: 'admin_user_id' },
  ip: { type: DataTypes.STRING },
  userAgent: { type: DataTypes.STRING, field: 'user_agent' },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
}, {
  tableName: 'admin_user_sessions',
  underscored: true,
  updatedAt: false,
});

const AdminAuditLog = sequelize.define('AdminAuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  adminUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'admin_user_id' },
  action: { type: DataTypes.STRING, allowNull: false },
  targetUserId: { type: DataTypes.INTEGER, field: 'target_user_id' },
  ip: { type: DataTypes.STRING },
  detail: { type: DataTypes.JSON },
  createdAt: { type: DataTypes.DATE, field: 'created_at', defaultValue: DataTypes.NOW },
}, {
  tableName: 'admin_audit_logs',
  underscored: true,
  updatedAt: false,
});

const AdminImpersonationToken = sequelize.define('AdminImpersonationToken', {
  token: { type: DataTypes.STRING, primaryKey: true },
  adminUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'admin_user_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  usedAt: { type: DataTypes.DATE, field: 'used_at' },
  ip: { type: DataTypes.STRING },
}, {
  tableName: 'admin_impersonation_tokens',
  underscored: true,
  timestamps: false,
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

// Inventory model (per product)
const Inventory = sequelize.define('Inventory', {
  productId: { type: DataTypes.INTEGER, primaryKey: true, field: 'product_id' },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  safetyStock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'safety_stock' },
  reserved: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  warehouseLocation: { type: DataTypes.STRING, field: 'warehouse_location' },
}, {
  tableName: 'inventory',
  underscored: true,
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

// Marketing segments (dynamic user sets)
const Segment = sequelize.define('Segment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  definition: { type: DataTypes.JSON, allowNull: false },
  size: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'segments',
  underscored: true,
  timestamps: false,
});

// Campaigns (scheduling, linked to segments)
const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  segmentId: { type: DataTypes.INTEGER, allowNull: false, field: 'segment_id' },
  couponCode: { type: DataTypes.STRING, field: 'coupon_code' },
  startsAt: { type: DataTypes.DATE, field: 'starts_at' },
  endsAt: { type: DataTypes.DATE, field: 'ends_at' },
  status: { type: DataTypes.ENUM('draft','scheduled','running','paused','finished'), allowNull: false, defaultValue: 'draft' },
}, {
  tableName: 'campaigns',
  underscored: true,
  indexes: [
    { fields: ['segment_id'] },
    { fields: ['status'] },
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

// CMS: Home layout versions (draft/published)
const HomeLayout = sequelize.define('HomeLayout', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  json: { type: DataTypes.JSON, allowNull: false },
  version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  publishedAt: { type: DataTypes.DATE, field: 'published_at' },
}, {
  tableName: 'home_layouts',
  underscored: true,
});

// CMS: Marketing banners
const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  imageUrl: { type: DataTypes.STRING, allowNull: false, field: 'image_url' },
  linkUrl: { type: DataTypes.STRING, field: 'link_url' },
  startsAt: { type: DataTypes.DATE, field: 'starts_at' },
  endsAt: { type: DataTypes.DATE, field: 'ends_at' },
  placement: { type: DataTypes.ENUM('home-hero','rail','sidebar'), allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'banners',
  underscored: true,
  indexes: [
    { fields: ['placement'] },
    { fields: ['starts_at'] },
    { fields: ['ends_at'] },
  ],
});

// CMS: Legal or content pages
const Page = sequelize.define('Page', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  body: { type: DataTypes.TEXT, allowNull: false }, // markdown or html
  publishedAt: { type: DataTypes.DATE, field: 'published_at' },
}, {
  tableName: 'pages',
  underscored: true,
  indexes: [
    { unique: true, fields: ['slug'] },
  ],
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

// (OrderStatusHistory and PaymentEvent are defined later in this file)

// Inventory movement audit
const InventoryMovement = sequelize.define('InventoryMovement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
  type: { type: DataTypes.STRING, allowNull: false }, // adjust|reserve|release|sale|return
  qty: { type: DataTypes.INTEGER, allowNull: false }, // signed quantity
  reason: { type: DataTypes.STRING },
  orderId: { type: DataTypes.INTEGER, field: 'order_id' },
  userId: { type: DataTypes.INTEGER, field: 'user_id' },
}, {
  tableName: 'inventory_movements',
  underscored: true,
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

// User telemetry
User.hasMany(UserEvent, { as: 'events', foreignKey: 'userId' });
UserEvent.belongsTo(User, { foreignKey: 'userId' });

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

// Inventory relations
Product.hasOne(Inventory, { as: 'inventory', foreignKey: 'productId' });
Inventory.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(InventoryMovement, { as: 'inventoryMovements', foreignKey: 'productId' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId' });

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

// Segments & Campaigns
Segment.hasMany(Campaign, { as: 'campaigns', foreignKey: 'segmentId' });
Campaign.belongsTo(Segment, { foreignKey: 'segmentId' });

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

// Admin relations
AdminUser.hasMany(AdminUserSession, { as: 'sessions', foreignKey: 'adminUserId' });
AdminUserSession.belongsTo(AdminUser, { foreignKey: 'adminUserId' });
AdminUser.hasMany(AdminAuditLog, { as: 'auditLogs', foreignKey: 'adminUserId' });
AdminAuditLog.belongsTo(AdminUser, { foreignKey: 'adminUserId' });
AdminUser.hasMany(AdminImpersonationToken, { as: 'impersonationTokens', foreignKey: 'adminUserId' });
AdminImpersonationToken.belongsTo(AdminUser, { foreignKey: 'adminUserId' });
User.hasMany(AdminImpersonationToken, { as: 'impersonationTokens', foreignKey: 'userId' });
AdminImpersonationToken.belongsTo(User, { foreignKey: 'userId' });

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

// Inventory hooks for Order lifecycle
async function withInventory(models) {
  const { Inventory: Inv, InventoryMovement: Mov, Product: Prod } = models;
  return { Inv, Mov, Prod };
}

async function reserveForOrder(order, options) {
  const { OrderItem } = module.exports; // avoid circular
  const { Inv, Mov, Prod } = await withInventory(module.exports);
  const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: options?.transaction });
  for (const it of items) {
    const [inv] = await Inv.findOrCreate({ where: { productId: it.productId }, defaults: { stock: 0, safetyStock: 0, reserved: 0 }, transaction: options?.transaction });
    // anti-oversell: available >= qty
    const prod = await Prod.findByPk(it.productId, { transaction: options?.transaction });
    const available = (parseInt(prod.stock, 10) || 0) - (parseInt(inv.reserved, 10) || 0);
    if (available < it.quantity) {
      throw new Error(`Insufficient available stock for product ${it.productId}`);
    }
    inv.reserved = (parseInt(inv.reserved, 10) || 0) + it.quantity;
    await inv.save({ transaction: options?.transaction });
    await Mov.create({ productId: it.productId, type: 'reserve', qty: it.quantity, orderId: order.id }, { transaction: options?.transaction });
  }
}

async function finalizeSaleForOrder(order, options) {
  const { OrderItem } = module.exports;
  const { Inv, Mov, Prod } = await withInventory(module.exports);
  const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: options?.transaction });
  for (const it of items) {
    const [inv] = await Inv.findOrCreate({ where: { productId: it.productId }, defaults: { stock: 0, safetyStock: 0, reserved: 0 }, transaction: options?.transaction });
    // decrement product and inventory stock; reduce reserved
    const prod = await Prod.findByPk(it.productId, { transaction: options?.transaction, lock: options?.transaction ? options.transaction.LOCK.UPDATE : undefined });
    const newProdStock = (parseInt(prod.stock, 10) || 0) - it.quantity;
    if (newProdStock < 0) throw new Error(`Negative stock for product ${it.productId}`);
    prod.stock = newProdStock;
    await prod.save({ transaction: options?.transaction });
    inv.stock = (parseInt(inv.stock, 10) || 0) - it.quantity;
    if (inv.stock < 0) inv.stock = 0; // guard
    inv.reserved = Math.max(0, (parseInt(inv.reserved, 10) || 0) - it.quantity);
    await inv.save({ transaction: options?.transaction });
    await Mov.create({ productId: it.productId, type: 'sale', qty: -it.quantity, orderId: order.id }, { transaction: options?.transaction });
  }
}

async function releaseForOrder(order, options) {
  const { OrderItem } = module.exports;
  const { Inv, Mov } = await withInventory(module.exports);
  const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: options?.transaction });
  for (const it of items) {
    const [inv] = await Inv.findOrCreate({ where: { productId: it.productId }, defaults: { stock: 0, safetyStock: 0, reserved: 0 }, transaction: options?.transaction });
    inv.reserved = Math.max(0, (parseInt(inv.reserved, 10) || 0) - it.quantity);
    await inv.save({ transaction: options?.transaction });
    await Mov.create({ productId: it.productId, type: 'release', qty: -it.quantity, orderId: order.id }, { transaction: options?.transaction });
  }
}

async function returnToStockForOrder(order, options) {
  const { OrderItem } = module.exports;
  const { Inv, Mov, Prod } = await withInventory(module.exports);
  const items = await OrderItem.findAll({ where: { orderId: order.id }, transaction: options?.transaction });
  for (const it of items) {
    const [inv] = await Inv.findOrCreate({ where: { productId: it.productId }, defaults: { stock: 0, safetyStock: 0, reserved: 0 }, transaction: options?.transaction });
    const prod = await Prod.findByPk(it.productId, { transaction: options?.transaction, lock: options?.transaction ? options.transaction.LOCK.UPDATE : undefined });
    prod.stock = (parseInt(prod.stock, 10) || 0) + it.quantity;
    await prod.save({ transaction: options?.transaction });
    inv.stock = (parseInt(inv.stock, 10) || 0) + it.quantity;
    await inv.save({ transaction: options?.transaction });
    await Mov.create({ productId: it.productId, type: 'return', qty: it.quantity, orderId: order.id }, { transaction: options?.transaction });
  }
}

// When an order is created, reserve items
const OrderCreatedHook = async (order, options) => {
  try {
    if (order.status === 'pending') {
      await reserveForOrder(order, options);
    }
  } catch (e) {
    // Re-throw to abort creation
    throw e;
  }
};

// When an order status changes, apply movements
const OrderUpdatedHook = async (order, options) => {
  try {
    if (!order.changed('status')) return;
    const from = order.previous('status');
    const to = order.status;
    // paid: finalize sale and decrease stock
    if (to === 'paid') {
      await finalizeSaleForOrder(order, options);
    }
    // canceled while pending/picking: release reservation
    if (to === 'canceled' && (from === 'pending' || from === 'picking')) {
      await releaseForOrder(order, options);
    }
    // refunded or canceled after paid: return to stock
    if ((to === 'refunded' || to === 'canceled') && (from === 'paid' || from === 'shipped' || from === 'delivered')) {
      await returnToStockForOrder(order, options);
    }
  } catch (e) {
    throw e;
  }
};

// Attach hooks after Order is defined
// Note: Order is defined above in this file
// eslint-disable-next-line no-use-before-define
Order?.addHook?.('afterCreate', OrderCreatedHook);
// eslint-disable-next-line no-use-before-define
Order?.addHook?.('afterUpdate', OrderUpdatedHook);

// Export models and sync helper
module.exports = {
  sequelize,
  User,
  // CMS
  HomeLayout,
  Banner,
  Page,
  AdminUser,
  AdminUserSession,
  AdminAuditLog,
  AdminImpersonationToken,
  SocialIdentity,
  Address,
  UserEvent,
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
  Segment,
  Campaign,
  Review,
  RefreshToken,
  IdempotencyKey,
  ProductMedia,
  ProductPriceHistory,
  OrderStatusHistory,
  PaymentEvent,
  Inventory,
  InventoryMovement,
};
