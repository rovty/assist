import { FastifyRequest, FastifyReply } from 'fastify';

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    tenantContext?: TenantContext;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const tenantId = request.headers['x-tenant-id'] as string | undefined;
  const userId = request.headers['x-user-id'] as string | undefined;
  const userRole = request.headers['x-user-role'] as string | undefined;

  if (!tenantId || !userId) {
    return reply.status(401).send({ error: 'Missing required tenant/user headers' });
  }

  request.tenantContext = {
    tenantId,
    userId,
    userRole: userRole ?? 'agent',
  };
}
