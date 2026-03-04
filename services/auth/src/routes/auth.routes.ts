import type { FastifyInstance } from 'fastify';

import { success } from '@assist/shared-utils';

import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema, refreshTokenSchema, changePasswordSchema } from '../schemas/auth.schema.js';
import { authenticate } from '../middleware/auth.js';

export async function authRoutes(app: FastifyInstance) {
  // ─── POST /auth/register ───
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await authService.register(body);
    return reply.status(201).send(success(result));
  });

  // ─── POST /auth/login ───
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login(body, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.send(success(result));
  });

  // ─── POST /auth/refresh ───
  app.post('/refresh', async (request, reply) => {
    const body = refreshTokenSchema.parse(request.body);
    const result = await authService.refreshAccessToken(body.refreshToken);
    return reply.send(success(result));
  });

  // ─── POST /auth/logout ───
  app.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken?: string };
    const accessToken = request.headers.authorization?.slice(7);
    await authService.logout(request.user!.sub, refreshToken, accessToken);
    return reply.send(success({ message: 'Logged out successfully' }));
  });

  // ─── GET /auth/me ───
  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const result = await authService.getProfile(request.user!.sub);
    return reply.send(success(result));
  });

  // ─── POST /auth/change-password ───
  app.post('/change-password', { preHandler: [authenticate] }, async (request, reply) => {
    const body = changePasswordSchema.parse(request.body);
    await authService.changePassword(request.user!.sub, body.currentPassword, body.newPassword);
    return reply.send(success({ message: 'Password changed successfully' }));
  });

  // ─── POST /auth/verify-token ───
  // Internal endpoint for API Gateway to verify tokens
  app.post('/verify-token', async (request, reply) => {
    const { token } = request.body as { token: string };
    const payload = await authService.verifyAccessToken(token);
    return reply.send(success(payload));
  });
}
