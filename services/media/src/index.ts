import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { mediaRoutes } from './routes/media.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('media');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  });

  await app.register(cors, { origin: env.CORS_ORIGINS.split(','), credentials: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.headers['x-tenant-id'] as string || request.ip,
  });
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
      files: env.MAX_FILES_PER_UPLOAD,
    },
  });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(mediaRoutes, { prefix: '/media' });

  return app;
}

async function start() {
  try {
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    logger.info(`🚀 Media service running on http://localhost:${env.PORT}`);
    logger.info(`📂 Storage: ${env.STORAGE_PROVIDER}`);
    logger.info(`📏 Max file size: ${env.MAX_FILE_SIZE_MB}MB`);
  } catch (err) {
    logger.fatal(err, 'Failed to start media service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
