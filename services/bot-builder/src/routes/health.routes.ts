import { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import mongoose from 'mongoose';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, string> = { status: 'ok', service: 'bot-builder' };

    try {
      await redis.ping();
      checks.redis = 'connected';
    } catch {
      checks.redis = 'disconnected';
    }

    checks.mongodb = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const isHealthy = checks.redis === 'connected' && checks.mongodb === 'connected';
    return reply.status(isHealthy ? 200 : 503).send(checks);
  });
}
