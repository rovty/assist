import type { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import { aiService } from '../services/ai.service.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};

    try {
      await redis.ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    const aiStatus = aiService.getStatus();
    checks['ai-provider'] = aiStatus.configured ? 'ok' : 'error';

    const allHealthy = checks['redis'] === 'ok';
    return reply.status(allHealthy ? 200 : 503).send({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'ai-engine',
      version: '0.1.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
      ai: aiStatus,
    });
  });
}
