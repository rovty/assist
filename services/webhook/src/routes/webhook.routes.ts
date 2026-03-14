import { FastifyInstance } from 'fastify';
import { createLogger } from '@assist/shared-utils';
import { authMiddleware } from '../middleware/auth.js';
import {
  createEndpointSchema,
  updateEndpointSchema,
  endpointParamsSchema,
  listEndpointsSchema,
  listDeliveriesSchema,
  retryDeliverySchema,
} from '../schemas/webhook.schema.js';
import {
  createEndpoint,
  getEndpoint,
  listEndpoints,
  updateEndpoint,
  deleteEndpoint,
  listDeliveries,
  retryDelivery,
  getEndpointStats,
  dispatchEvent,
} from '../services/webhook.service.js';

const logger = createLogger('webhook:routes');

export async function webhookRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ── Create Endpoint ────────────────────────────────────── */
  app.post('/endpoints', {
    handler: async (request, reply) => {
      const { body } = createEndpointSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const endpoint = await createEndpoint(tenantId, userId, body);
      return reply.status(201).send(endpoint);
    },
  });

  /* ── List Endpoints ─────────────────────────────────────── */
  app.get('/endpoints', {
    handler: async (request, reply) => {
      const { querystring } = listEndpointsSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const result = await listEndpoints(tenantId, querystring);
      return reply.send(result);
    },
  });

  /* ── Get Endpoint ───────────────────────────────────────── */
  app.get('/endpoints/:endpointId', {
    handler: async (request, reply) => {
      const { params } = endpointParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const endpoint = await getEndpoint(tenantId, params.endpointId);
      if (!endpoint) return reply.status(404).send({ error: 'Endpoint not found' });
      return reply.send(endpoint);
    },
  });

  /* ── Update Endpoint ────────────────────────────────────── */
  app.patch('/endpoints/:endpointId', {
    handler: async (request, reply) => {
      const { params, body } = updateEndpointSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updateEndpoint(tenantId, params.endpointId, body);
      if (!updated) return reply.status(404).send({ error: 'Endpoint not found' });
      return reply.send(updated);
    },
  });

  /* ── Delete Endpoint ────────────────────────────────────── */
  app.delete('/endpoints/:endpointId', {
    handler: async (request, reply) => {
      const { params } = endpointParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deleteEndpoint(tenantId, params.endpointId);
      return reply.status(204).send();
    },
  });

  /* ── Endpoint Stats ─────────────────────────────────────── */
  app.get('/endpoints/:endpointId/stats', {
    handler: async (request, reply) => {
      const { params } = endpointParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const stats = await getEndpointStats(tenantId, params.endpointId);
      return reply.send(stats);
    },
  });

  /* ── List Deliveries ────────────────────────────────────── */
  app.get('/endpoints/:endpointId/deliveries', {
    handler: async (request, reply) => {
      const { params, querystring } = listDeliveriesSchema.parse({
        params: request.params,
        querystring: request.query,
      });
      const { tenantId } = request.tenantContext!;

      const result = await listDeliveries(tenantId, params.endpointId, querystring);
      return reply.send(result);
    },
  });

  /* ── Retry Delivery ─────────────────────────────────────── */
  app.post('/endpoints/:endpointId/deliveries/:deliveryId/retry', {
    handler: async (request, reply) => {
      const { params } = retryDeliverySchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const delivery = await retryDelivery(tenantId, params.endpointId, params.deliveryId);
      if (!delivery) return reply.status(404).send({ error: 'Delivery not found' });
      return reply.send(delivery);
    },
  });

  /* ── Dispatch Event (internal) ──────────────────────────── */
  app.post('/dispatch', {
    handler: async (request, reply) => {
      const { eventType, payload } = request.body as {
        eventType: string;
        payload: Record<string, unknown>;
      };
      const { tenantId } = request.tenantContext!;

      if (!eventType) return reply.status(400).send({ error: 'eventType required' });

      const results = await dispatchEvent(tenantId, eventType, payload || {});
      return reply.status(202).send({ dispatched: results.length, results });
    },
  });
}
