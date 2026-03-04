import type { FastifyInstance } from 'fastify';

import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};

    // Check PostgreSQL
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks['database'] = 'ok';
    } catch {
      checks['database'] = 'error';
    }

    // Check Redis
    try {
      await redis.ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    const allHealthy = Object.values(checks).every((v) => v === 'ok');

    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'auth-service',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    });
  });
}
