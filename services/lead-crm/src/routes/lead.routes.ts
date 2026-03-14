import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import {
  createLeadSchema,
  updateLeadSchema,
  leadParamsSchema,
  listLeadsSchema,
  moveLeadSchema,
  logActivitySchema,
  listActivitiesSchema,
} from '../schemas/lead.schema.js';
import {
  createLead,
  getLead,
  listLeads,
  updateLead,
  deleteLead,
  moveLeadToStage,
  logActivity,
  listActivities,
  getLeadStats,
} from '../services/lead.service.js';
import { calculateScore } from '../services/scoring.service.js';

export async function leadRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ── Create Lead ─────────────────────────────────────────── */
  app.post('/', {
    handler: async (request, reply) => {
      const { body } = createLeadSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const lead = await createLead(tenantId, userId, body);
      return reply.status(201).send(lead);
    },
  });

  /* ── List Leads ──────────────────────────────────────────── */
  app.get('/', {
    handler: async (request, reply) => {
      const { querystring } = listLeadsSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const result = await listLeads(tenantId, querystring);
      return reply.send(result);
    },
  });

  /* ── Lead Stats ──────────────────────────────────────────── */
  app.get('/stats', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const stats = await getLeadStats(tenantId);
      return reply.send(stats);
    },
  });

  /* ── Get Lead ────────────────────────────────────────────── */
  app.get('/:leadId', {
    handler: async (request, reply) => {
      const { params } = leadParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const lead = await getLead(tenantId, params.leadId);
      if (!lead) return reply.status(404).send({ error: 'Lead not found' });
      return reply.send(lead);
    },
  });

  /* ── Update Lead ─────────────────────────────────────────── */
  app.patch('/:leadId', {
    handler: async (request, reply) => {
      const { params, body } = updateLeadSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateLead(tenantId, params.leadId, body);
      if (!updated) return reply.status(404).send({ error: 'Lead not found' });
      return reply.send(updated);
    },
  });

  /* ── Delete Lead ─────────────────────────────────────────── */
  app.delete('/:leadId', {
    handler: async (request, reply) => {
      const { params } = leadParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteLead(tenantId, params.leadId);
      return reply.status(204).send();
    },
  });

  /* ── Score Lead ──────────────────────────────────────────── */
  app.post('/:leadId/score', {
    handler: async (request, reply) => {
      const { params } = leadParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const score = await calculateScore(tenantId, params.leadId);
      return reply.send({ score });
    },
  });

  /* ── Move Lead to Stage ──────────────────────────────────── */
  app.post('/:leadId/move', {
    handler: async (request, reply) => {
      const { params, body } = moveLeadSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId, userId } = request.tenantContext!;

      const lead = await moveLeadToStage(tenantId, params.leadId, userId, body.pipelineId, body.stageId);
      if (!lead) return reply.status(404).send({ error: 'Lead not found' });
      return reply.send(lead);
    },
  });

  /* ── Log Activity ────────────────────────────────────────── */
  app.post('/:leadId/activities', {
    handler: async (request, reply) => {
      const { params, body } = logActivitySchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId, userId } = request.tenantContext!;

      const activity = await logActivity(tenantId, params.leadId, userId, body);
      return reply.status(201).send(activity);
    },
  });

  /* ── List Activities ─────────────────────────────────────── */
  app.get('/:leadId/activities', {
    handler: async (request, reply) => {
      const { params, querystring } = listActivitiesSchema.parse({
        params: request.params,
        querystring: request.query,
      });
      const { tenantId } = request.tenantContext!;

      const result = await listActivities(tenantId, params.leadId, querystring);
      return reply.send(result);
    },
  });
}
