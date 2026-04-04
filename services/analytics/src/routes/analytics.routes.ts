import { FastifyInstance } from 'fastify';
import { createLogger } from '@assist/shared-utils';
import { authMiddleware } from '../middleware/auth.js';
import {
  overviewQuerySchema,
  conversationMetricsSchema,
  agentMetricsSchema,
  aiMetricsSchema,
  channelMetricsSchema,
  trackEventBodySchema,
  batchTrackSchema,
} from '../schemas/analytics.schema.js';
import {
  getOverview,
  getConversationMetrics,
  getAgentMetrics,
  getAiMetrics,
  getChannelMetrics,
  trackEvent,
  trackBatch,
} from '../services/analytics.service.js';

const logger = createLogger('analytics:routes');

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ── Dashboard Overview ─────────────────────────────────── */
  app.get('/overview', async (request, reply) => {
    const period = overviewQuerySchema.shape.querystring.parse(request.query);
    const { tenantId } = request.tenantContext!;

    const overview = await getOverview(tenantId, period);
    return reply.send(overview);
  });

  /* ── Conversation Metrics ───────────────────────────────── */
  app.get('/conversations', async (request, reply) => {
    const period = conversationMetricsSchema.shape.querystring.parse(request.query);
    const { tenantId } = request.tenantContext!;

    const metrics = await getConversationMetrics(tenantId, period);
    return reply.send({ data: metrics });
  });

  /* ── Agent Performance ──────────────────────────────────── */
  app.get('/agents', async (request, reply) => {
    const period = agentMetricsSchema.shape.querystring.parse(request.query);
    const { tenantId } = request.tenantContext!;

    const metrics = await getAgentMetrics(tenantId, period);
    return reply.send({ data: metrics });
  });

  /* ── AI Metrics ─────────────────────────────────────────── */
  app.get('/ai', async (request, reply) => {
    const period = aiMetricsSchema.shape.querystring.parse(request.query);
    const { tenantId } = request.tenantContext!;

    const metrics = await getAiMetrics(tenantId, period);
    return reply.send({ data: metrics });
  });

  /* ── Channel Metrics ────────────────────────────────────── */
  app.get('/channels', async (request, reply) => {
    const period = channelMetricsSchema.shape.querystring.parse(request.query);
    const { tenantId } = request.tenantContext!;

    const metrics = await getChannelMetrics(tenantId, period);
    return reply.send({ data: metrics });
  });

  /* ── Track Event ────────────────────────────────────────── */
  app.post('/track', {
    handler: async (request, reply) => {
      const parsed = trackEventBodySchema.shape.body.parse(request.body);
      const { tenantId, userId } = request.tenantContext!;

      const result = await trackEvent(tenantId, userId, parsed);
      return reply.status(202).send(result);
    },
  });

  /* ── Batch Track ────────────────────────────────────────── */
  app.post('/track/batch', {
    handler: async (request, reply) => {
      const parsed = batchTrackSchema.shape.body.parse(request.body);
      const { tenantId, userId } = request.tenantContext!;

      const result = await trackBatch(tenantId, userId, parsed.events);
      return reply.status(202).send(result);
    },
  });
}
