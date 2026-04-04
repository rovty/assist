import type { FastifyInstance } from 'fastify';

import { BadRequestError, success } from '@assist/shared-utils';

import { authService } from '../services/auth.service.js';
import { accessTokenSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.js';

const LEGACY_AUTH_MESSAGE = 'Dashboard authentication has moved to Supabase Auth. Use Supabase sign-in/sign-up flows instead of this endpoint.';
const LEGACY_PASSWORD_MESSAGE = 'Password management now belongs to Supabase Auth. Use the Supabase password or magic-link flows instead of this endpoint.';

export async function authRoutes(app: FastifyInstance) {
  // ─── POST /auth/context ───
  // Gateway-facing endpoint that validates a Supabase access token
  // and resolves the app-specific tenant + role context.
  app.post('/context', async (request, reply) => {
    const { token } = accessTokenSchema.parse(request.body);
    const result = await authService.resolveAuthContext(token);
    return reply.send(success(result));
  });

  // ─── Deprecated local auth endpoints ───
  app.post('/register', async () => {
    throw new BadRequestError(LEGACY_AUTH_MESSAGE);
  });

  app.post('/login', async () => {
    throw new BadRequestError(LEGACY_AUTH_MESSAGE);
  });

  app.post('/refresh', async () => {
    throw new BadRequestError(LEGACY_AUTH_MESSAGE);
  });

  // ─── POST /auth/logout ───
  app.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
    const accessToken = request.headers.authorization?.slice(7);
    await authService.logout(request.user!.sub, accessToken);
    return reply.send(success({ message: 'Logged out successfully' }));
  });

  // ─── GET /auth/me ───
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const result = await authService.getProfile(request.user!.sub);
    return reply.send(success(result));
  });

  // ─── POST /auth/change-password ───
  app.post('/change-password', { preHandler: [authenticate] }, async () => {
    throw new BadRequestError(LEGACY_PASSWORD_MESSAGE);
  });

  // ─── POST /auth/verify-token ───
  // Backwards-compatible alias for systems that still call the older name.
  app.post('/verify-token', async (request, reply) => {
    const { token } = accessTokenSchema.parse(request.body);
    const payload = await authService.resolveAuthContext(token);
    return reply.send(success(payload));
  });
}
