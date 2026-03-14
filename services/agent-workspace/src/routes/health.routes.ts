import { FastifyInstance } from 'fastify';
import { getRedis } from '../utils/redis.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    try {
      const redis = getRedis();
      await redis.ping();
      return reply.send({ status: 'ok', redis: 'connected' });
    } catch {
      return reply.status(503).send({ status: 'degraded', redis: 'disconnected' });
    }
  });
}
