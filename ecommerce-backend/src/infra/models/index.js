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
  recommendedAge: { type: DataTypes.INTEGER, field: 'recommended_age' },
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

// Order model
const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'created' },
}, {
  tableName: 'orders',
  underscored: true,
});

// OrderItem model
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal: { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, {
  tableName: 'order_items',
  underscored: true,
});

// Payment model
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  provider: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  externalId: { type: DataTypes.STRING }, // id from MP or other providers
  rawPayload: { type: DataTypes.JSONB },
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

// Coupon model
const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, {
  tableName: 'coupons',
  underscored: true,
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
Order.hasMany(OrderItem, { as: 'items' });
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem, { as: 'orderItems' });
OrderItem.belongsTo(Product);

Order.hasOne(Payment, { as: 'payment' });
Payment.belongsTo(Order);

Order.hasOne(Shipment, { as: 'shipment' });
Shipment.belongsTo(Order);

Order.belongsTo(Coupon, { as: 'coupon' });
Coupon.hasMany(Order);

// Review relations
Product.hasMany(Review, { as: 'reviews' });
Review.belongsTo(Product);

// Product media relations
Product.hasMany(ProductMedia, { as: 'media', foreignKey: 'productId' });
ProductMedia.belongsTo(Product, { foreignKey: 'productId' });

// Product price history relations
Product.hasMany(ProductPriceHistory, { as: 'priceHistory', foreignKey: 'productId' });
ProductPriceHistory.belongsTo(Product, { foreignKey: 'productId' });

// Hook to record price changes
Product.addHook('afterUpdate', async (product, options) => {
  if (product.previous('price') !== product.price) {
    await ProductPriceHistory.create(
      { productId: product.id, price: product.price },
      { transaction: options.transaction }
    );
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
  Review,
  RefreshToken,
  IdempotencyKey,
  ProductMedia,
  ProductPriceHistory,
};