import type { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, string> = {};

    // Redis
    try {
      await redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    // Storage
    checks.storage = env.STORAGE_PROVIDER;

    const healthy = checks.redis === 'ok';

    reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      service: 'media',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
