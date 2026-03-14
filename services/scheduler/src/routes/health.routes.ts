import { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, string> = { status: 'ok', service: 'scheduler' };

    try {
      await redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
    }

    const isHealthy = checks.redis === 'connected';
    return reply.status(isHealthy ? 200 : 503).send(checks);
  });
}
