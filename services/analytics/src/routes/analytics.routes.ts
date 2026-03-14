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
  app.get('/overview', {
    schema: { querystring: overviewQuerySchema.shape.querystring },
    handler: async (request, reply) => {
      const period = request.query as any;
      const { tenantId } = request.tenantContext!;

      const overview = await getOverview(tenantId, period);
      return reply.send(overview);
    },
  });

  /* ── Conversation Metrics ───────────────────────────────── */
  app.get('/conversations', {
    schema: { querystring: conversationMetricsSchema.shape.querystring },
    handler: async (request, reply) => {
      const period = request.query as any;
      const { tenantId } = request.tenantContext!;

      const metrics = await getConversationMetrics(tenantId, period);
      return reply.send({ data: metrics });
    },
  });

  /* ── Agent Performance ──────────────────────────────────── */
  app.get('/agents', {
    schema: { querystring: agentMetricsSchema.shape.querystring },
    handler: async (request, reply) => {
      const period = request.query as any;
      const { tenantId } = request.tenantContext!;

      const metrics = await getAgentMetrics(tenantId, period);
      return reply.send({ data: metrics });
    },
  });

  /* ── AI Metrics ─────────────────────────────────────────── */
  app.get('/ai', {
    schema: { querystring: aiMetricsSchema.shape.querystring },
    handler: async (request, reply) => {
      const period = request.query as any;
      const { tenantId } = request.tenantContext!;

      const metrics = await getAiMetrics(tenantId, period);
      return reply.send({ data: metrics });
    },
  });

  /* ── Channel Metrics ────────────────────────────────────── */
  app.get('/channels', {
    schema: { querystring: channelMetricsSchema.shape.querystring },
    handler: async (request, reply) => {
      const period = request.query as any;
      const { tenantId } = request.tenantContext!;

      const metrics = await getChannelMetrics(tenantId, period);
      return reply.send({ data: metrics });
    },
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
