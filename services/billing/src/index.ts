import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectMongo } from './utils/db.js';
import { connectRedis } from './utils/redis.js';
import { billingRoutes } from './routes/billing.routes.js';
import { stripeWebhookRoutes } from './routes/stripe-webhook.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('billing');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  await app.register(cors, { origin: env.CORS_ORIGINS.split(','), credentials: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.headers['x-tenant-id'] as string || request.ip,
  });

  app.setErrorHandler(errorHandler);

  // Stripe webhook must be registered before body parsing (needs raw body)
  await app.register(stripeWebhookRoutes, { prefix: '/stripe/webhook' });
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(billingRoutes, { prefix: '/billing' });

  return app;
}

async function start() {
  try {
    await connectMongo();
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`🚀 Billing service running on http://localhost:${env.PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start billing service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
