import type { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import { verifySmtp } from '../services/email.service.js';

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

    // SMTP (non-critical in development)
    const smtpOk = await verifySmtp();
    checks.smtp = smtpOk ? 'ok' : 'warning';

    const healthy = checks.redis === 'ok';

    reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      service: 'notification',
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
