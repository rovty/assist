import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectRedis } from './utils/redis.js';
import { aiRoutes } from './routes/ai.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { aiService } from './services/ai.service.js';

const logger = createLogger('ai-engine');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    requestTimeout: 60000, // Higher timeout for LLM calls
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
  await app.register(aiRoutes, { prefix: '/ai' });

  return app;
}

async function start() {
  try {
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    const status = aiService.getStatus();
    logger.info(`🚀 AI Engine running on http://localhost:${env.PORT}`);
    logger.info(`🤖 AI Provider: ${status.provider} (model: ${status.model})`);
    if (!status.configured) {
      logger.warn('⚠️  No AI API key configured — running in MOCK mode. Set AZURE_OPENAI_API_KEY or OPENAI_API_KEY.');
    }
  } catch (err) {
    logger.fatal(err, 'Failed to start AI engine');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
