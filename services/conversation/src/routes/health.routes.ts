import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { redis } from '../utils/redis.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};

    // MongoDB check
    try {
      checks['database'] = mongoose.connection.readyState === 1 ? 'ok' : 'error';
    } catch {
      checks['database'] = 'error';
    }

    // Redis check
    try {
      await redis.ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'ok');
    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'conversation-service',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
