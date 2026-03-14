import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectMongo } from './utils/db.js';
import { connectRedis } from './utils/redis.js';
import { leadRoutes } from './routes/lead.routes.js';
import { pipelineRoutes } from './routes/pipeline.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('lead-crm');

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
  await app.register(leadRoutes, { prefix: '/leads' });
  await app.register(pipelineRoutes, { prefix: '/leads/pipelines' });

  return app;
}

async function start() {
  try {
    await connectMongo();
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`🚀 Lead/CRM service running on http://localhost:${env.PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start lead-crm service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
