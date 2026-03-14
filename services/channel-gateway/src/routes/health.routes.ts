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

    // Check channel providers (non-critical)
    checks.whatsapp = env.WHATSAPP_ACCESS_TOKEN ? 'configured' : 'not_configured';
    checks.telegram = env.TELEGRAM_BOT_TOKEN ? 'configured' : 'not_configured';
    checks.messenger = env.MESSENGER_PAGE_ACCESS_TOKEN ? 'configured' : 'not_configured';

    const healthy = checks.redis === 'ok';

    reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      service: 'channel-gateway',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
