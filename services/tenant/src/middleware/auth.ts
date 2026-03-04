import type { FastifyRequest, FastifyReply } from 'fastify';

import { UnauthorizedError } from '@assist/shared-utils';

// In a real setup, the API Gateway sets these headers after JWT verification.
// For direct access in development, we parse the X-Tenant-ID and X-User-ID headers.
// In production, the auth middleware would verify JWT via the Auth Service.

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

  if (!tenantId || !userId) {
    throw new UnauthorizedError('Missing tenant context headers');
  }

  request.tenantId = tenantId;
  request.userId = userId;
  request.userRole = userRole;
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.userRole || !roles.includes(request.userRole)) {
      throw new UnauthorizedError(`Requires role: ${roles.join(' or ')}`);
    }
  };
}
