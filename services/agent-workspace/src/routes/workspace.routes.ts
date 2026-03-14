import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import {
  updateAgentStatusSchema,
  enqueueSchema,
  dequeueSchema,
  queueItemParamsSchema,
  updateRoutingConfigSchema,
  createCannedResponseSchema,
  updateCannedResponseSchema,
  cannedResponseParamsSchema,
  searchCannedResponsesSchema,
} from '../schemas/workspace.schema.js';
import {
  enqueue,
  dequeue,
  getQueueItem,
  removeFromQueue,
  listQueue,
  getQueueStats,
} from '../services/queue.service.js';
import {
  updateAgentStatus,
  getAgentStatus,
  listOnlineAgents,
  getRoutingConfig,
  updateRoutingConfig,
  routeToAgent,
  releaseAgentSlot,
  getAgentStats,
} from '../services/routing.service.js';
import {
  createCannedResponse,
  getCannedResponse,
  getCannedByShortcut,
  listCannedResponses,
  updateCannedResponse,
  deleteCannedResponse,
} from '../services/canned.service.js';

export async function workspaceRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ─── Agent Status ───────────────────────────────────────── */

  app.put('/agents/me/status', {
    handler: async (request, reply) => {
      const { body } = updateAgentStatusSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const state = await updateAgentStatus(tenantId, userId, body);
      return reply.send(state);
    },
  });

  app.get('/agents/me/status', {
    handler: async (request, reply) => {
      const { tenantId, userId } = request.tenantContext!;
      const state = await getAgentStatus(tenantId, userId);
      if (!state) return reply.send({ status: 'offline' });
      return reply.send(state);
    },
  });

  app.get('/agents', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const agents = await listOnlineAgents(tenantId);
      return reply.send(agents);
    },
  });

  app.get('/agents/stats', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const stats = await getAgentStats(tenantId);
      return reply.send(stats);
    },
  });

  /* ─── Queue ──────────────────────────────────────────────── */

  app.post('/queue', {
    handler: async (request, reply) => {
      const { body } = enqueueSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const item = await enqueue(tenantId, body);
      return reply.status(201).send(item);
    },
  });

  app.post('/queue/dequeue', {
    handler: async (request, reply) => {
      const parsed = dequeueSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;
      const agentId = parsed.body?.agentId ?? userId;

      const item = await dequeue(tenantId, agentId);
      if (!item) return reply.status(204).send();
      return reply.send(item);
    },
  });

  app.get('/queue', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const items = await listQueue(tenantId);
      return reply.send(items);
    },
  });

  app.get('/queue/stats', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const stats = await getQueueStats(tenantId);
      return reply.send(stats);
    },
  });

  app.get('/queue/:itemId', {
    handler: async (request, reply) => {
      const { params } = queueItemParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const item = await getQueueItem(tenantId, params.itemId);
      if (!item) return reply.status(404).send({ error: 'Queue item not found' });
      return reply.send(item);
    },
  });

  app.delete('/queue/:itemId', {
    handler: async (request, reply) => {
      const { params } = queueItemParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await removeFromQueue(tenantId, params.itemId);
      return reply.status(204).send();
    },
  });

  /* ─── Routing ────────────────────────────────────────────── */

  app.get('/routing', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const config = await getRoutingConfig(tenantId);
      return reply.send(config);
    },
  });

  app.put('/routing', {
    handler: async (request, reply) => {
      const { body } = updateRoutingConfigSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const config = await updateRoutingConfig(tenantId, body);
      return reply.send(config);
    },
  });

  app.post('/routing/assign', {
    handler: async (request, reply) => {
      const body = request.body as { skills?: string[] } | undefined;
      const { tenantId } = request.tenantContext!;

      const agentId = await routeToAgent(tenantId, body?.skills ?? []);
      if (!agentId) return reply.status(204).send();
      return reply.send({ agentId });
    },
  });

  app.post('/routing/release', {
    handler: async (request, reply) => {
      const body = request.body as { agentId: string };
      const { tenantId } = request.tenantContext!;

      await releaseAgentSlot(tenantId, body.agentId);
      return reply.status(204).send();
    },
  });

  /* ─── Canned Responses ───────────────────────────────────── */

  app.post('/canned', {
    handler: async (request, reply) => {
      const { body } = createCannedResponseSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const response = await createCannedResponse(tenantId, userId, body);
      return reply.status(201).send(response);
    },
  });

  app.get('/canned', {
    handler: async (request, reply) => {
      const { querystring } = searchCannedResponsesSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const responses = await listCannedResponses(tenantId, querystring);
      return reply.send(responses);
    },
  });

  app.get('/canned/shortcut/:shortcut', {
    handler: async (request, reply) => {
      const params = request.params as { shortcut: string };
      const { tenantId } = request.tenantContext!;

      const response = await getCannedByShortcut(tenantId, `/${params.shortcut}`);
      if (!response) return reply.status(404).send({ error: 'Canned response not found' });
      return reply.send(response);
    },
  });

  app.get('/canned/:responseId', {
    handler: async (request, reply) => {
      const { params } = cannedResponseParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const response = await getCannedResponse(tenantId, params.responseId);
      if (!response) return reply.status(404).send({ error: 'Canned response not found' });
      return reply.send(response);
    },
  });

  app.patch('/canned/:responseId', {
    handler: async (request, reply) => {
      const { params, body } = updateCannedResponseSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateCannedResponse(tenantId, params.responseId, body);
      if (!updated) return reply.status(404).send({ error: 'Canned response not found' });
      return reply.send(updated);
    },
  });

  app.delete('/canned/:responseId', {
    handler: async (request, reply) => {
      const { params } = cannedResponseParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteCannedResponse(tenantId, params.responseId);
      return reply.status(204).send();
    },
  });
}
