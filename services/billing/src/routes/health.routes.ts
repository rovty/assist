import { FastifyInstance } from 'fastify';
import { getRedis } from '../utils/redis.js';
import mongoose from 'mongoose';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, string> = {};

    try {
      const redis = getRedis();
      await redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
    }

    checks.mongodb = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const healthy = Object.values(checks).every((v) => v === 'connected');
    return reply.status(healthy ? 200 : 503).send({ status: healthy ? 'ok' : 'degraded', ...checks });
  });
}
