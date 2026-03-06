import type { FastifyReply, FastifyRequest } from 'fastify';

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
  userEmail?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    tenantContext: TenantContext;
  }
}

export async function extractTenantContext(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const tenantId = request.headers['x-tenant-id'] as string;
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as string;
  const userEmail = request.headers['x-user-email'] as string | undefined;

  if (!tenantId || !userId || !userRole) {
    reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing tenant context headers',
    });
    return;
  }

  request.tenantContext = { tenantId, userId, userRole, userEmail };
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.tenantContext) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(request.tenantContext.userRole.toLowerCase())) {
      reply.code(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
      return;
    }
  };
}
