// src/graphql/resolvers.js
// Implement GraphQL resolvers to access the database using Sequelize. Each resolver
// is mapped to a corresponding field in the GraphQL schema. All database
// operations run asynchronously and return promises.

const { Op } = require('sequelize');

const resolvers = {
  Query: {
    // Fetch a list of products with optional filters
    products: async (_parent, args, { models }) => {
      const { Product, Category, Review } = models;
      const where = {};
      const include = [];
      const { search, theme, minPrice, maxPrice } = args;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price[Op.gte] = minPrice;
        if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
      }
      // Include category filter if theme specified
      if (theme) {
        include.push({ model: Category, where: { name: { [Op.iLike]: `%${theme}%` } }, through: { attributes: [] } });
      }
      // Always include categories and reviews for completeness
      include.push({ model: Category, through: { attributes: [] } });
      include.push({ model: Review, include: [models.User] });
      return await Product.findAll({ where, include });
    },
    // Fetch all categories
    categories: async (_parent, _args, { models }) => {
      const { Category } = models;
      return await Category.findAll();
    },
    // Return the authenticated user's cart
    cart: async (_parent, _args, { models, user }) => {
      if (!user) return null;
      const { Cart, CartItem, Product } = models;
      const cart = await Cart.findOne({ where: { userId: user.id }, include: { model: CartItem, include: Product } });
      return cart;
    },
    // Return the authenticated user
    me: async (_parent, _args, { models, user }) => {
      if (!user) return null;
      const { User, Address, Wishlist, WishlistItem, Product } = models;
      return await User.findByPk(user.id, {
        include: [
          { model: Address },
          { model: Wishlist, include: { model: WishlistItem, include: Product } },
        ],
      });
    },
    // Fetch all orders for the current user
    orders: async (_parent, _args, { models, user }) => {
      if (!user) return [];
      const { Order, OrderItem, Product, Payment, Shipment, Coupon } = models;
      return await Order.findAll({
        where: { userId: user.id },
        include: [
          { model: OrderItem, include: Product },
          { model: Payment },
          { model: Shipment },
          { model: Coupon },
        ],
        order: [['createdAt', 'DESC']],
      });
    },
  },
  Mutation: {
    // Add item to the cart or update quantity if it already exists
    addToCart: async (_parent, { productId, quantity }, { models, user }) => {
      if (!user) throw new Error('Not authenticated');
      const { Cart, CartItem, Product } = models;
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');
      // Find or create cart
      const [cart] = await Cart.findOrCreate({ where: { userId: user.id }, defaults: {} });
      // Find existing item
      const [item] = await CartItem.findOrCreate({
        where: { cartId: cart.id, productId: product.id },
        defaults: { quantity: 0, unitPrice: product.price },
      });
      // Update quantity
      item.quantity += quantity;
      item.unitPrice = product.price;
      await item.save();
      return await Cart.findByPk(cart.id, { include: { model: CartItem, include: Product } });
    },
    // Update the quantity of a cart item
    updateCartItem: async (_parent, { itemId, quantity }, { models, user }) => {
      if (!user) throw new Error('Not authenticated');
      const { Cart, CartItem, Product } = models;
      // Only allow modifying items that belong to the authenticated user
      const item = await CartItem.findOne({
        where: { id: itemId },
        include: { model: Cart, where: { userId: user.id } },
      });
      if (!item) throw new Error('Cart item not found');
      if (quantity <= 0) {
        await item.destroy();
      } else {
        item.quantity = quantity;
        await item.save();
      }
      const cart = await Cart.findOne({ where: { id: item.cartId, userId: user.id }, include: { model: CartItem, include: Product } });
      return cart;
    },
    // Remove a cart item completely
    removeCartItem: async (_parent, { itemId }, { models, user }) => {
      if (!user) throw new Error('Not authenticated');
      const { Cart, CartItem, Product } = models;
      // Ensure the cart item exists and belongs to the current user
      const item = await CartItem.findOne({
        where: { id: itemId },
        include: { model: Cart, where: { userId: user.id } },
      });
      if (!item) throw new Error('Cart item not found');
      const cartId = item.cartId;
      await item.destroy();
      return await Cart.findOne({ where: { id: cartId, userId: user.id }, include: { model: CartItem, include: Product } });
    },
    // Create an order from the cart; moves items from cart to order
    createOrder: async (_parent, { couponCode }, { models, user }) => {
      if (!user) throw new Error('Not authenticated');
      const { Cart, CartItem, Order, OrderItem, Coupon, Product } = models;
      const cart = await Cart.findOne({ where: { userId: user.id }, include: { model: CartItem, include: Product } });
      if (!cart || cart.CartItems.length === 0) throw new Error('Cart is empty');
      return await models.sequelize.transaction(async (t) => {
        // Prepare coupon if provided
        let coupon = null;
        if (couponCode) {
          coupon = await Coupon.findOne({ where: { code: couponCode }, transaction: t });
        }
        // Compute total and create order
        const total = cart.CartItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
        const order = await Order.create({ userId: user.id, status: 'pending', total, couponId: coupon ? coupon.id : null }, { transaction: t });
        // Create order items
        for (const ci of cart.CartItems) {
          await OrderItem.create({ orderId: order.id, productId: ci.productId, quantity: ci.quantity, unitPrice: ci.unitPrice, subtotal: ci.quantity * ci.unitPrice }, { transaction: t });
        }
        // Clear cart items
        await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
        return await Order.findByPk(order.id, { transaction: t, include: [ { model: OrderItem, include: Product }, 'Payment', 'Shipment', 'Coupon' ] });
      });
    },
    // Create a Mercado Pago payment preference for an order (stubbed implementation)
    createPaymentPreference: async (_parent, { orderId }, { models, user }) => {
      if (!user) throw new Error('Not authenticated');
      const { Order, Payment } = models;
      const order = await Order.findOne({ where: { id: orderId, userId: user.id } });
      if (!order) throw new Error('Order not found');
      // Stub: create a payment record; in a real integration you would call Mercado Pago SDK here
      const payment = await Payment.create({ orderId: order.id, provider: 'mp', status: 'pending', amount: order.total });
      return payment;
    },
  },
  // Field resolvers for nested relations (optional if eager loaded via include)
  Order: {
    items: async (order, _args, { models }) => {
      return await models.OrderItem.findAll({ where: { orderId: order.id }, include: models.Product });
    },
    payment: async (order, _args, { models }) => {
      return await models.Payment.findOne({ where: { orderId: order.id } });
    },
    shipment: async (order, _args, { models }) => {
      return await models.Shipment.findOne({ where: { orderId: order.id } });
    },
    coupon: async (order, _args, { models }) => {
      if (!order.couponId) return null;
      return await models.Coupon.findByPk(order.couponId);
    },
  },
};

module.exports = resolvers;