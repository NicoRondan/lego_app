// src/app/server.js
// Entry point for the Express application. Sets up HTTP middleware, mounts
// feature modules, configures GraphQL and starts the server.

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
// Apollo Server 5 requires the standalone '@apollo/server' package and
// the express4 middleware for integration with Express 4.
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

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
  const webhooksRouter = require('../modules/webhooks/router');

async function startServer() {
  const app = express();
  // Core security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com'],
          styleSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com', "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        },
      },
      hsts: { maxAge: 31536000 },
      noSniff: true,
      frameguard: { action: 'deny' },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
    })
  );
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
  app.use('/webhooks', webhooksRouter);

  // Configure Apollo Server for GraphQL (Apollo Server 5)
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();
  // Attach the Apollo Server middleware at /graphql with context function
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: req.user || null,
        models: require('../infra/models'),
      }),
    }),
  );

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