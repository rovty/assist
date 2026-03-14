import type { FastifyInstance } from 'fastify';
import { redis } from '../utils/redis.js';
import mongoose from 'mongoose';
import { embeddingService } from '../services/embedding.service.js';

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

    // MongoDB
    try {
      const state = mongoose.connection.readyState;
      checks.mongodb = state === 1 ? 'ok' : 'error';
    } catch {
      checks.mongodb = 'error';
    }

    // Embedding provider
    const embeddingStatus = embeddingService.getStatus();
    checks.embeddings = embeddingStatus.configured ? 'ok' : 'warning';

    const healthy = checks.redis === 'ok' && checks.mongodb === 'ok';

    reply.code(healthy ? 200 : 503).send({
      status: healthy ? 'healthy' : 'degraded',
      service: 'knowledge-base',
      checks,
      embeddingProvider: embeddingStatus.provider,
      timestamp: new Date().toISOString(),
    });
  });
}
