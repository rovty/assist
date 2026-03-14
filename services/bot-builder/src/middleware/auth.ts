import { FastifyReply, FastifyRequest } from 'fastify';
import { createLogger } from '@assist/shared-utils';

const logger = createLogger('bot-builder:auth');

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    tenantContext?: TenantContext;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.headers['x-tenant-id'] as string;
  const userId = request.headers['x-user-id'] as string;
  const role = request.headers['x-user-role'] as string;

  if (!tenantId || !userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Missing tenant context headers',
    });
  }

  request.tenantContext = { tenantId, userId, role: role || 'agent' };
}
