import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { schedulerRoutes } from './routes/scheduler.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { startTickLoop } from './services/cron.service.js';

const logger = createLogger('scheduler');

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
  await app.register(schedulerRoutes, { prefix: '/scheduler' });

  return app;
}

async function start() {
  try {
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // Start the cron tick loop
    startTickLoop();

    logger.info(`🚀 Scheduler service running on http://localhost:${env.PORT}`);
    logger.info(`⏱️ Tick interval: ${env.TICK_INTERVAL_MS}ms`);
  } catch (err) {
    logger.fatal(err, 'Failed to start scheduler service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
