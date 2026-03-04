import type { FastifyInstance } from 'fastify';

import { success } from '@assist/shared-utils';

import { apiKeyService } from '../services/api-key.service.js';
import { createApiKeySchema } from '../schemas/api-key.schema.js';
import { authenticate, authorize } from '../middleware/auth.js';

export async function apiKeyRoutes(app: FastifyInstance) {
  // All API key routes require authentication + OWNER or ADMIN role
  app.addHook('preHandler', authenticate);

  // ─── POST /api-keys ───
  app.post('/', { preHandler: [authorize('OWNER', 'ADMIN')] }, async (request, reply) => {
    const body = createApiKeySchema.parse(request.body);
    const result = await apiKeyService.createApiKey(
      request.user!.tenantId,
      request.user!.sub,
      body,
    );
    return reply.status(201).send(success(result));
  });

  // ─── GET /api-keys ───
  app.get('/', { preHandler: [authorize('OWNER', 'ADMIN')] }, async (request, reply) => {
    const keys = await apiKeyService.listApiKeys(request.user!.tenantId);
    return reply.send(success(keys));
  });

  // ─── DELETE /api-keys/:id ───
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authorize('OWNER', 'ADMIN')] },
    async (request, reply) => {
      await apiKeyService.revokeApiKey(request.user!.tenantId, request.params.id);
      return reply.send(success({ message: 'API key revoked' }));
    },
  );
}
