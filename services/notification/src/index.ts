import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('notification');

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

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(notificationRoutes, { prefix: '/notifications' });
  await app.register(webhookRoutes, { prefix: '/notifications/webhooks' });

  return app;
}

async function start() {
  try {
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`🚀 Notification service running on http://localhost:${env.PORT}`);
    logger.info(`📧 SMTP: ${env.SMTP_HOST}:${env.SMTP_PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start notification service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
