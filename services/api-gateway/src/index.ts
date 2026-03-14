import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import httpProxy from '@fastify/http-proxy';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { createLogger } from '@assist/shared-utils';

import { env } from './env.js';
import { gatewayAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.routes.js';

const logger = createLogger('api-gateway');

/**
 * Registers an http-proxy for a given upstream + prefix.
 * Tenant context headers are already injected by gatewayAuth preHandler
 * so the proxy simply forwards them.
 */
async function registerProxy(
  app: FastifyInstance,
  opts: { upstream: string; prefix: string; rewritePrefix?: string },
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (app as any).register(httpProxy, {
    upstream: opts.upstream,
    prefix: opts.prefix,
    rewritePrefix: opts.rewritePrefix ?? opts.prefix,
    http2: false,
  });
}

async function buildServer() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    requestTimeout: 60000,
    genReqId: () => `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  });

  // ─── Global Plugins ───
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    keyGenerator: (request) => {
      if (request.user?.tenantId) return `tenant:${request.user.tenantId}`;
      return (request.headers['x-forwarded-for'] as string) || request.ip;
    },
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Assist API Gateway',
        description: 'Unified API Gateway for all Assist microservices',
        version: '0.1.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  // ─── Error Handler ───
  app.setErrorHandler(errorHandler);

  // ─── JWT Auth Hook ───
  app.addHook('preHandler', gatewayAuth);

  // ─── Health Check (gateway's own) ───
  await app.register(healthRoutes, { prefix: '/health' });

  // ─── Proxies ───
  await registerProxy(app, { upstream: env.AUTH_SERVICE_URL, prefix: '/auth' });
  await registerProxy(app, { upstream: env.AUTH_SERVICE_URL, prefix: '/users' });
  await registerProxy(app, { upstream: env.AUTH_SERVICE_URL, prefix: '/api-keys' });
  await registerProxy(app, { upstream: env.TENANT_SERVICE_URL, prefix: '/tenants' });
  await registerProxy(app, { upstream: env.CONVERSATION_SERVICE_URL, prefix: '/conversations' });
  await registerProxy(app, { upstream: env.CONVERSATION_SERVICE_URL, prefix: '/contacts' });
  await registerProxy(app, { upstream: env.AI_SERVICE_URL, prefix: '/ai' });
  await registerProxy(app, { upstream: env.NOTIFICATION_SERVICE_URL, prefix: '/notifications' });
  await registerProxy(app, { upstream: env.KNOWLEDGE_BASE_SERVICE_URL, prefix: '/kb' });
  await registerProxy(app, { upstream: env.MEDIA_SERVICE_URL, prefix: '/media' });
  await registerProxy(app, { upstream: env.CHANNEL_GATEWAY_SERVICE_URL, prefix: '/channels' });
  await registerProxy(app, { upstream: env.ANALYTICS_SERVICE_URL, prefix: '/analytics' });
  await registerProxy(app, { upstream: env.WEBHOOK_SERVICE_URL, prefix: '/webhooks' });
  await registerProxy(app, { upstream: env.BOT_BUILDER_SERVICE_URL, prefix: '/bots' });
  await registerProxy(app, { upstream: env.LEAD_CRM_SERVICE_URL, prefix: '/leads' });
  await registerProxy(app, { upstream: env.SCHEDULER_SERVICE_URL, prefix: '/scheduler' });
  await registerProxy(app, { upstream: env.AGENT_WORKSPACE_SERVICE_URL, prefix: '/workspace' });
  await registerProxy(app, { upstream: env.BILLING_SERVICE_URL, prefix: '/billing' });

  return app;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`🚀 API Gateway running on http://localhost:${env.PORT}`);
    logger.info(`📚 API docs: http://localhost:${env.PORT}/docs`);
    logger.info('Proxying to services:');
    logger.info(`  /auth, /users, /api-keys → ${env.AUTH_SERVICE_URL}`);
    logger.info(`  /tenants                 → ${env.TENANT_SERVICE_URL}`);
    logger.info(`  /conversations, /contacts → ${env.CONVERSATION_SERVICE_URL}`);
    logger.info(`  /ai                      → ${env.AI_SERVICE_URL}`);
    logger.info(`  /notifications           → ${env.NOTIFICATION_SERVICE_URL}`);
    logger.info(`  /kb                      → ${env.KNOWLEDGE_BASE_SERVICE_URL}`);
    logger.info(`  /media                   → ${env.MEDIA_SERVICE_URL}`);
    logger.info(`  /channels                → ${env.CHANNEL_GATEWAY_SERVICE_URL}`);
    logger.info(`  /analytics               → ${env.ANALYTICS_SERVICE_URL}`);
    logger.info(`  /webhooks                → ${env.WEBHOOK_SERVICE_URL}`);
    logger.info(`  /bots                    → ${env.BOT_BUILDER_SERVICE_URL}`);
    logger.info(`  /leads                   → ${env.LEAD_CRM_SERVICE_URL}`);
    logger.info(`  /scheduler               → ${env.SCHEDULER_SERVICE_URL}`);
    logger.info(`  /workspace               → ${env.AGENT_WORKSPACE_SERVICE_URL}`);
    logger.info(`  /billing                 → ${env.BILLING_SERVICE_URL}`);
  } catch (err) {
    logger.fatal(err, 'Failed to start API Gateway');
    process.exit(1);
  }
}

start().catch(console.error);
export { buildServer };
