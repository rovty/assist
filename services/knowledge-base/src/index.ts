import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { connectDatabase } from './utils/db.js';
import { kbRoutes } from './routes/kb.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { embeddingService } from './services/embedding.service.js';

const logger = createLogger('knowledge-base');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    requestTimeout: 120000, // Higher timeout for document processing
  });

  await app.register(cors, { origin: env.CORS_ORIGINS.split(','), credentials: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.headers['x-tenant-id'] as string || request.ip,
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(kbRoutes, { prefix: '/knowledge-base' });

  return app;
}

async function start() {
  try {
    await connectRedis();
    await connectDatabase();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    const embStatus = embeddingService.getStatus();
    logger.info(`🚀 Knowledge Base service running on http://localhost:${env.PORT}`);
    logger.info(`🧠 Embedding provider: ${embStatus.provider} (model: ${embStatus.model})`);
    if (!embStatus.configured) {
      logger.warn('⚠️  No embedding API configured — running in MOCK mode');
    }
  } catch (err) {
    logger.fatal(err, 'Failed to start knowledge-base service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
