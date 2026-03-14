import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import {
  createCheckoutSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
  listInvoicesSchema,
  recordUsageSchema,
  getUsageSchema,
} from '../schemas/billing.schema.js';
import {
  getSubscription,
  initiateCheckout,
  updateSubscription,
  cancelSubscription,
  listInvoices,
  listPlans,
} from '../services/billing.service.js';
import { recordUsage, getUsage, checkUsageLimit } from '../services/usage.service.js';

export async function billingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ─── Plans ──────────────────────────────────────────────── */

  app.get('/plans', {
    handler: async (_request, reply) => {
      const plans = listPlans();
      return reply.send(plans);
    },
  });

  /* ─── Subscription ───────────────────────────────────────── */

  app.get('/subscription', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const sub = await getSubscription(tenantId);
      return reply.send(sub);
    },
  });

  app.post('/checkout', {
    handler: async (request, reply) => {
      const { body } = createCheckoutSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      // Use tenant email from header or fallback
      const email = (request.headers['x-user-email'] as string) ?? `${userId}@tenant.local`;
      const session = await initiateCheckout(tenantId, userId, email, body);
      return reply.send(session);
    },
  });

  app.patch('/subscription', {
    handler: async (request, reply) => {
      const { body } = updateSubscriptionSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const sub = await updateSubscription(tenantId, body);
      return reply.send(sub);
    },
  });

  app.post('/subscription/cancel', {
    handler: async (request, reply) => {
      const { body } = cancelSubscriptionSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const sub = await cancelSubscription(tenantId, body);
      return reply.send(sub);
    },
  });

  /* ─── Invoices ───────────────────────────────────────────── */

  app.get('/invoices', {
    handler: async (request, reply) => {
      const { querystring } = listInvoicesSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const result = await listInvoices(tenantId, querystring.page, querystring.limit);
      return reply.send(result);
    },
  });

  /* ─── Usage ──────────────────────────────────────────────── */

  app.post('/usage', {
    handler: async (request, reply) => {
      const { body } = recordUsageSchema.parse({ body: request.body });
      const { tenantId } = request.tenantContext!;

      const total = await recordUsage(tenantId, body);
      return reply.send({ metric: body.metric, total });
    },
  });

  app.get('/usage', {
    handler: async (request, reply) => {
      const { querystring } = getUsageSchema.parse({ querystring: request.query });
      const { tenantId } = request.tenantContext!;

      const usage = await getUsage(tenantId, querystring);
      return reply.send(usage);
    },
  });

  app.get('/usage/limit/:metric', {
    handler: async (request, reply) => {
      const params = request.params as { metric: string };
      const { tenantId } = request.tenantContext!;

      const sub = await getSubscription(tenantId);
      const planId = typeof sub === 'object' && 'planId' in sub ? sub.planId : 'free';
      const limit = await checkUsageLimit(tenantId, planId, params.metric);
      return reply.send(limit);
    },
  });
}
