import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { initClickHouse } from './utils/clickhouse.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('analytics');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  await app.register(cors, { origin: env.CORS_ORIGINS.split(','), credentials: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.headers['x-tenant-id'] as string || request.ip,
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(analyticsRoutes, { prefix: '/analytics' });

  return app;
}

async function start() {
  try {
    await connectRedis();
    await initClickHouse();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`🚀 Analytics service running on http://localhost:${env.PORT}`);
    logger.info(`📊 ClickHouse: ${env.CLICKHOUSE_URL}/${env.CLICKHOUSE_DATABASE}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start analytics service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
