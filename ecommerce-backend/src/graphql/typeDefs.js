// src/graphql/typeDefs.js
// Define the GraphQL schema for the application using the gql tag. This
// schema attempts to mirror the REST API and the underlying relational
// model, providing typed access to catalog, cart and order data.

const { gql } = require('graphql-tag'); 

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    addresses: [Address!]
    wishlist: Wishlist
    cart: Cart
    orders: [Order!]
  }

  type Address {
    id: ID!
    street: String
    city: String
  }

  type SocialIdentity {
    provider: String
    providerId: String
  }

  type Product {
    id: ID!
    code: String!
    name: String!
    description: String
    price: Float!
    currency: String
    image: String
    isNew: Boolean
    isOnSale: Boolean
    status: String
    stock: Int!
    categories: [Category!]
    reviews: [Review!]
  }

  type Category {
    id: ID!
    name: String!
    products: [Product!]
  }

  type Cart {
    id: ID!
    items: [CartItem!]
    user: User
  }

  type CartItem {
    id: ID!
    quantity: Int!
    unitPrice: Float!
    product: Product!
  }

  type Order {
    id: ID!
    status: String!
    total: Float!
    user: User!
    items: [OrderItem!]
    payment: Payment
    shipment: Shipment
    coupon: Coupon
  }

  type OrderItem {
    id: ID!
    quantity: Int!
    unitPrice: Float!
    subtotal: Float!
    product: Product!
  }

  type Payment {
    id: ID!
    provider: String!
    status: String!
    amount: Float!
  }

  type Shipment {
    id: ID!
    carrier: String
    tracking: String
    status: String
  }

  type Coupon {
    id: ID!
    code: String!
    type: String!
    value: Float!
  }

  type Wishlist {
    id: ID!
    items: [WishlistItem!]!
  }

  type WishlistItem {
    id: ID!
    product: Product!
  }

  type Review {
    id: ID!
    rating: Int!
    comment: String
    user: User!
    product: Product!
  }

  type Query {
    # Return a list of products applying optional search and price filters
    products(search: String, theme: String, minPrice: Float, maxPrice: Float): [Product!]
    # Return all available categories
    categories: [Category!]
    # Return the currently authenticated user's cart
    cart: Cart
    # Return details about the currently authenticated user
    me: User
    # Return the list of orders for the current user
    orders: [Order!]
  }

  type Mutation {
    # Add a product to the cart or increment quantity if already present
    addToCart(productId: ID!, quantity: Int!): Cart
    # Update a cart item's quantity
    updateCartItem(itemId: ID!, quantity: Int!): Cart
    # Remove an item from the cart
    removeCartItem(itemId: ID!): Cart
    # Create an order from the current cart (status pending) with optional coupon code
    createOrder(couponCode: String): Order
    # Create a payment preference for Mercado Pago for a given order
    createMpPreference(orderId: ID!): Payment
  }
`;

module.exports = typeDefs;