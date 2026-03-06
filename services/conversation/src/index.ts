import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { connectMongo } from './utils/db.js';
import { connectRedis } from './utils/redis.js';
import { conversationRoutes } from './routes/conversation.routes.js';
import { contactRoutes } from './routes/contact.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { setupWebSocket } from './websocket/socket.js';

const logger = createLogger('conversation-service');

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    requestTimeout: 30000,
  });

  await app.register(cors, { origin: env.CORS_ORIGINS.split(','), credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

  app.setErrorHandler(errorHandler);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(conversationRoutes, { prefix: '/conversations' });
  await app.register(contactRoutes, { prefix: '/contacts' });

  return app;
}

async function start() {
  try {
    // Connect to databases
    await connectMongo();
    await connectRedis();

    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // Setup WebSocket on the HTTP server
    const httpServer = app.server;
    const jwtSecret = process.env['JWT_SECRET'] ?? 'super-secret-jwt-key-must-be-at-least-32-chars-long';
    setupWebSocket(httpServer, jwtSecret);

    logger.info(`🚀 Conversation service running on http://localhost:${env.PORT}`);
    logger.info(`🔌 WebSocket ready on ws://localhost:${env.PORT}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start conversation service');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
