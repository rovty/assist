import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@assist/shared-utils';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string;
    userId?: string;
    userRole?: string;
  }
}

export async function extractTenantContext(request: FastifyRequest, _reply: FastifyReply) {
  const tenantId = request.headers['x-tenant-id'] as string;
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as string;
  if (!tenantId) throw new UnauthorizedError('Missing tenant context headers');
  request.tenantId = tenantId;
  request.userId = userId;
  request.userRole = userRole;
}
