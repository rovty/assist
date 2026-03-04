import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { apiKeyRoutes } from './routes/api-key.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

const logger = createLogger('auth-service');

async function buildServer() {
  const app = Fastify({
    logger: false, // We use our own pino logger
    trustProxy: true,
    requestTimeout: 30000,
  });

  // ─── Plugins ───
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  });

  await app.register(helmet);

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] as string || request.ip;
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Assist Auth Service',
        description: 'Authentication & authorization service for Assist platform',
        version: '0.1.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // ─── Error Handler ───
  app.setErrorHandler(errorHandler);

  // ─── Routes ───
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(apiKeyRoutes, { prefix: '/api-keys' });

  return app;
}

async function start() {
  try {
    const app = await buildServer();

    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`🚀 Auth service running on http://localhost:${env.PORT}`);
    logger.info(`📚 API docs: http://localhost:${env.PORT}/docs`);
  } catch (err) {
    logger.fatal(err, 'Failed to start auth service');
    process.exit(1);
  }
}

start().catch(console.error);

export { buildServer };
