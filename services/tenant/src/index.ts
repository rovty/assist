import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { tenantRoutes } from './routes/tenant.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('tenant-service');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    requestTimeout: 30000,
  });

  // ─── Plugins ───
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  });

  await app.register(helmet);
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

  // ─── Error Handler ───
  app.setErrorHandler(errorHandler);

  // ─── Routes ───
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(tenantRoutes, { prefix: '/tenants' });

  return app;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`🚀 Tenant service running on http://localhost:${env.PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start tenant service');
    process.exit(1);
  }
}

start().catch(console.error);

export { buildServer };
