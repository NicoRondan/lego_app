// src/app/server.js
// Entry point for the Express application. Sets up HTTP middleware, mounts
// feature modules, configures GraphQL and starts the server.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { ApolloServer } = require('apollo-server-express');

// Load environment variables from .env file if present
dotenv.config();

const typeDefs = require('../graphql/typeDefs');
const resolvers = require('../graphql/resolvers');
const { sequelize } = require('../infra/models');
const {
  authMiddleware,
  errorHandler,
  requestIdMiddleware,
} = require('../shared/middlewares');
const { logger } = require('../shared/logger');

// Import routers for each module
const authRouter = require('../modules/auth/router');
const catalogRouter = require('../modules/catalog/router');
const cartRouter = require('../modules/cart/router');
const ordersRouter = require('../modules/orders/router');
const paymentsRouter = require('../modules/payments/router');
const uploadsRouter = require('../modules/uploads/router');

async function startServer() {
  const app = express();

  // Core security middleware
  app.use(helmet());
  app.use(cors());

  // Attach request ID and logger
  app.use(requestIdMiddleware);

  // Body parsing
  app.use(express.json());

  // Authentication: decode JWT and populate req.user if present
  app.use(authMiddleware);

  // Mount REST routes
  app.use('/auth', authRouter);
  app.use('/products', catalogRouter);
  const categoriesRouter = require('../modules/catalog/categoriesRouter');
  app.use('/categories', categoriesRouter);
  app.use('/cart', cartRouter);
  app.use('/orders', ordersRouter);
  app.use('/payments', paymentsRouter);
  app.use('/uploads', uploadsRouter);

  // Configure Apollo Server for GraphQL
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Pass the authenticated user into GraphQL context
      return {
        user: req.user || null,
        models: require('../infra/models'),
      };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Centralised error handling
  app.use(errorHandler);

  // Start database connection
  await sequelize.sync();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server ready at http://localhost:${port}`);
    logger.info(
      `GraphQL ready at http://localhost:${port}${apolloServer.graphqlPath}`,
    );
  });
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
});