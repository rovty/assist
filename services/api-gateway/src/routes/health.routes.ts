import type { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};
    try {
      await redis.ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    // Check downstream services
    const services = [
      { name: 'auth', url: `${process.env['AUTH_SERVICE_URL'] ?? 'http://localhost:3001'}/health` },
      { name: 'tenant', url: `${process.env['TENANT_SERVICE_URL'] ?? 'http://localhost:3002'}/health` },
      { name: 'conversation', url: `${process.env['CONVERSATION_SERVICE_URL'] ?? 'http://localhost:3003'}/health` },
      { name: 'ai-engine', url: `${process.env['AI_SERVICE_URL'] ?? 'http://localhost:3004'}/health` },
      { name: 'notification', url: `${process.env['NOTIFICATION_SERVICE_URL'] ?? 'http://localhost:3005'}/health` },
    ];

    for (const svc of services) {
      try {
        const response = await fetch(svc.url, { signal: AbortSignal.timeout(3000) });
        checks[svc.name] = response.ok ? 'ok' : 'error';
      } catch {
        checks[svc.name] = 'error';
      }
    }

    const criticalHealthy = checks['redis'] === 'ok';
    return reply.status(criticalHealthy ? 200 : 503).send({
      status: criticalHealthy ? 'healthy' : 'degraded',
      service: 'api-gateway',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
