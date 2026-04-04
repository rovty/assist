import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '@assist/shared-utils';
import type { JwtPayload } from '@assist/shared-types';
import { createLogger } from '@assist/shared-utils';

import { env } from '../env.js';

const logger = createLogger('api-gateway:auth');

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

const PUBLIC_ROUTES = new Set([
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-token',
  '/auth/context',
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
  if (isPublicRoute(request.url)) {
    return;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    logger.warn({ url: request.url, origin: request.headers.origin }, 'Rejected request without bearer token');
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const response = await fetch(`${env.AUTH_SERVICE_URL}/auth/context`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    logger.warn(
      { url: request.url, status: response.status, statusText: response.statusText },
      'Auth service rejected bearer token',
    );
    throw new UnauthorizedError('Invalid or expired token');
  }

  const payload = await response.json() as { success: boolean; data?: JwtPayload };
  if (!payload.success || !payload.data) {
    logger.warn({ url: request.url }, 'Auth service returned an invalid auth context payload');
    throw new UnauthorizedError('Invalid or expired token');
  }

  request.user = payload.data;
  request.headers['x-tenant-id'] = payload.data.tenantId;
  request.headers['x-user-id'] = payload.data.sub;
  request.headers['x-user-role'] = payload.data.role;
  request.headers['x-user-email'] = payload.data.email;
  request.headers['x-request-id'] = request.id;
}
