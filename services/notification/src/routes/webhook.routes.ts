import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { extractTenantContext, requireRole } from '../middleware/auth.js';
import { registerWebhookSchema, updateWebhookSchema } from '../schemas/notification.schema.js';
import {
  registerWebhook,
  getWebhooks,
  getWebhook,
  updateWebhook,
  deleteWebhook,
} from '../services/webhook.service.js';

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', extractTenantContext);

  // ─── Register Webhook ───
  app.post('/', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const body = registerWebhookSchema.parse(request.body);

    const webhook = await registerWebhook({
      tenantId: request.tenantContext.tenantId,
      url: body.url,
      events: body.events,
      secret: body.secret ?? crypto.randomBytes(32).toString('hex'),
      isActive: true,
    });

    reply.code(201).send({ data: webhook });
  });

  // ─── List Webhooks ───
  app.get('/', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const webhooks = await getWebhooks(request.tenantContext.tenantId);
    reply.send({ data: webhooks, count: webhooks.length });
  });

  // ─── Get Webhook ───
  app.get<{ Params: { id: string } }>('/:id', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const webhook = await getWebhook(request.tenantContext.tenantId, request.params.id);
    if (!webhook) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Webhook not found' });
      return;
    }
    reply.send({ data: webhook });
  });

  // ─── Update Webhook ───
  app.patch<{ Params: { id: string } }>('/:id', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const body = updateWebhookSchema.parse(request.body);

    const webhook = await updateWebhook(request.tenantContext.tenantId, request.params.id, body);
    if (!webhook) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Webhook not found' });
      return;
    }
    reply.send({ data: webhook });
  });

  // ─── Delete Webhook ───
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const deleted = await deleteWebhook(request.tenantContext.tenantId, request.params.id);
    if (!deleted) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Webhook not found' });
      return;
    }
    reply.code(204).send();
  });
}
