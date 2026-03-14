import { FastifyInstance } from 'fastify';
import { createLogger } from '@assist/shared-utils';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBotSchema,
  updateBotSchema,
  saveFlowSchema,
  botParamsSchema,
  listBotsSchema,
  simulateSchema,
} from '../schemas/bot.schema.js';
import {
  createBot,
  getBot,
  listBots,
  updateBot,
  deleteBot,
  saveFlow,
  getFlow,
  createVersion,
  listVersions,
  publishBot,
  unpublishBot,
} from '../services/bot.service.js';
import { simulateBot } from '../services/simulator.service.js';

const logger = createLogger('bot-builder:routes');

export async function botRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ── Create Bot ──────────────────────────────────────────── */
  app.post('/', {
    handler: async (request, reply) => {
      const { body } = createBotSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const bot = await createBot(tenantId, userId, body);
      return reply.status(201).send(bot);
    },
  });

  /* ── List Bots ───────────────────────────────────────────── */
  app.get('/', {
    handler: async (request, reply) => {
      const { querystring } = listBotsSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const result = await listBots(tenantId, querystring);
      return reply.send(result);
    },
  });

  /* ── Get Bot ─────────────────────────────────────────────── */
  app.get('/:botId', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const bot = await getBot(tenantId, params.botId);
      if (!bot) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(bot);
    },
  });

  /* ── Update Bot ──────────────────────────────────────────── */
  app.patch('/:botId', {
    handler: async (request, reply) => {
      const { params, body } = updateBotSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateBot(tenantId, params.botId, body);
      if (!updated) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(updated);
    },
  });

  /* ── Delete Bot ──────────────────────────────────────────── */
  app.delete('/:botId', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteBot(tenantId, params.botId);
      return reply.status(204).send();
    },
  });

  /* ── Save Flow ───────────────────────────────────────────── */
  app.put('/:botId/flow', {
    handler: async (request, reply) => {
      const { params, body } = saveFlowSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const bot = await saveFlow(tenantId, params.botId, body);
      if (!bot) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(bot);
    },
  });

  /* ── Get Flow ────────────────────────────────────────────── */
  app.get('/:botId/flow', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const flow = await getFlow(tenantId, params.botId);
      if (!flow) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(flow);
    },
  });

  /* ── Create Version ──────────────────────────────────────── */
  app.post('/:botId/versions', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId, userId } = request.tenantContext!;

      const version = await createVersion(tenantId, params.botId, userId);
      if (!version) return reply.status(404).send({ error: 'Bot not found' });
      return reply.status(201).send(version);
    },
  });

  /* ── List Versions ───────────────────────────────────────── */
  app.get('/:botId/versions', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const versions = await listVersions(tenantId, params.botId);
      return reply.send(versions);
    },
  });

  /* ── Publish Bot ─────────────────────────────────────────── */
  app.post('/:botId/publish', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId, userId } = request.tenantContext!;

      const bot = await publishBot(tenantId, params.botId, userId);
      if (!bot) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(bot);
    },
  });

  /* ── Unpublish Bot ───────────────────────────────────────── */
  app.post('/:botId/unpublish', {
    handler: async (request, reply) => {
      const { params } = botParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const bot = await unpublishBot(tenantId, params.botId);
      if (!bot) return reply.status(404).send({ error: 'Bot not found or not published' });
      return reply.send(bot);
    },
  });

  /* ── Simulate Bot ────────────────────────────────────────── */
  app.post('/:botId/simulate', {
    handler: async (request, reply) => {
      const { params, body } = simulateSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const result = await simulateBot(tenantId, params.botId, body.input, body.variables);
      if (!result) return reply.status(404).send({ error: 'Bot not found' });
      return reply.send(result);
    },
  });
}
