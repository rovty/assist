import jwt from 'jsonwebtoken';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@assist/shared-utils';
import type { JwtPayload } from '@assist/shared-types';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/** Public routes that bypass JWT verification */
const PUBLIC_ROUTES = new Set([
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-token',
  '/health',
  '/tenants/plans',
]);

function isPublicRoute(url: string): boolean {
  const path = url.split('?')[0] ?? url;
  if (PUBLIC_ROUTES.has(path)) return true;
  if (path.endsWith('/health')) return true;
  return false;
}

export async function gatewayAuth(request: FastifyRequest, _reply: FastifyReply) {
  const url = request.url;

  if (isPublicRoute(url)) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  // Check Redis blacklist
  const blacklisted = await redis.get(`bl:${token}`);
  if (blacklisted) {
    throw new UnauthorizedError('Token has been revoked');
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET as string) as unknown as JwtPayload;
    request.user = payload;

    // Inject tenant context headers directly into the request.
    // The proxy will forward these to downstream services.
    request.headers['x-tenant-id'] = payload.tenantId;
    request.headers['x-user-id'] = payload.sub;
    request.headers['x-user-role'] = payload.role;
    request.headers['x-user-email'] = payload.email;
    request.headers['x-request-id'] = request.id;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
