import { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import { clickhouse } from '../utils/clickhouse.js';
import { env } from '../env.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, string> = { status: 'ok', service: 'analytics' };

    try {
      await redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
    }

    try {
      await clickhouse.query({ query: 'SELECT 1', format: 'JSON' });
      checks.clickhouse = 'connected';
    } catch {
      checks.clickhouse = 'disconnected';
    }

    const isHealthy = checks.redis === 'connected';
    return reply.status(isHealthy ? 200 : 503).send(checks);
  });
}
