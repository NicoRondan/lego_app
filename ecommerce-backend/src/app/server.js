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
const { seed } = require('../infra/seeds/seed');
const {
  authMiddleware,
  errorHandler,
  requestIdMiddleware,
  parseCookies,
  rateLimit,
} = require('../shared/middlewares');
const csrfMiddleware = require('../shared/csrf');
const { logger } = require('../shared/logger');

// Import routers for each module
const authRouter = require('../modules/auth/routes');
const catalogRouter = require('../modules/catalog/router');
const cartRouter = require('../modules/cart/router');
const wishlistRouter = require('../modules/wishlist/router');
const ordersRouter = require('../modules/orders/router');
const paymentsRouter = require('../modules/payments/router');
const uploadsRouter = require('../modules/uploads/router');
const webhooksRouter = require('../modules/webhooks/router');
const adminOrdersRouter = require('../modules/admin/ordersRouter');
const adminPaymentsRouter = require('../modules/admin/paymentsRouter');

async function createApp() {
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
  const allowList = [process.env.FRONTEND_URL].filter(Boolean);
  const corsOptions = {
    origin(origin, callback) {
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Attach request ID and logger
  app.use(requestIdMiddleware);

  // Log each incoming request and its response status using the custom logger
  app.use((req, res, next) => {
    req.log.info({ method: req.method, url: req.url }, 'Incoming request');
    res.on('finish', () => {
      req.log.info({ status: res.statusCode }, 'Request completed');
    });
    next();
  });

  // Body parsing
  app.use(express.json());

  // Parse cookies
  app.use(parseCookies);

  // Authentication: decode JWT and populate req.user if present
  app.use(authMiddleware);

  // Rate limiting
  const authLimiter = rateLimit({ windowMs: 60 * 1000, limit: 1000 });
  const webhookLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5 });

  // Mount REST routes
  app.use('/auth', authLimiter, authRouter);
  app.use('/products', catalogRouter);
  const categoriesRouter = require('../modules/catalog/categoriesRouter');
  app.use('/categories', categoriesRouter);
  app.use('/cart', cartRouter);
  app.use('/wishlist', wishlistRouter);
  app.use('/orders', ordersRouter);
  app.use('/payments', paymentsRouter);
  app.use('/uploads', uploadsRouter);
  app.use('/webhooks', webhookLimiter, webhooksRouter);
  // Admin (RBAC)
  const { requireRole } = require('../shared/middlewares');
  app.use('/admin/orders', requireRole('admin'), adminOrdersRouter);
  app.use('/admin/payments', requireRole('admin'), adminPaymentsRouter);

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
    csrfMiddleware,
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: req.user || null,
        models: require('../infra/models'),
      }),
    }),
  );

  // Centralised error handling
  app.use(errorHandler);
  return app;
}

async function startServer() {
  await seed();
  const app = await createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    logger.info(`Server ready at http://localhost:${port}`);
    logger.info(
      `GraphQL ready at http://localhost:${port}/graphql`,
    );
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
  });
}

module.exports = { createApp, startServer };
