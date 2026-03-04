import type { FastifyRequest, FastifyReply } from 'fastify';

import { UnauthorizedError } from '@assist/shared-utils';
import type { JwtPayload } from '@assist/shared-types';

import { authService } from '../services/auth.service.js';

// Extend Fastify's request type
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * JWT authentication middleware.
 * Extracts and verifies the Bearer token from Authorization header.
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);
  const payload = await authService.verifyAccessToken(token);

  request.user = payload;
}

/**
 * Role-based authorization middleware factory.
 * Usage: { preHandler: [authenticate, authorize('OWNER', 'ADMIN')] }
 */
export function authorize(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (!roles.includes(request.user.role)) {
      throw new UnauthorizedError(`Insufficient permissions. Required roles: ${roles.join(', ')}`);
    }
  };
}
