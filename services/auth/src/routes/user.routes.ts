import type { FastifyInstance } from 'fastify';

import { success, NotFoundError } from '@assist/shared-utils';

import { prisma } from '../utils/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

export async function userRoutes(app: FastifyInstance) {
  // All user routes require authentication
  app.addHook('preHandler', authenticate);

  // ─── GET /users ───
  // List users in the current tenant
  app.get('/', { preHandler: [authorize('OWNER', 'ADMIN')] }, async (request, reply) => {
    const { page = 1, pageSize = 20 } = request.query as { page?: number; pageSize?: number };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId: request.user!.tenantId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { tenantId: request.user!.tenantId } }),
    ]);

    return reply.send(success({
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }));
  });

  // ─── GET /users/:id ───
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const user = await prisma.user.findFirst({
      where: { id: request.params.id, tenantId: request.user!.tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', request.params.id);
    }

    return reply.send(success(user));
  });

  // ─── PUT /users/:id/role ───
  app.put<{ Params: { id: string }; Body: { role: string } }>(
    '/:id/role',
    { preHandler: [authorize('OWNER', 'ADMIN')] },
    async (request, reply) => {
      const { role } = request.body;

      const user = await prisma.user.findFirst({
        where: { id: request.params.id, tenantId: request.user!.tenantId },
      });

      if (!user) {
        throw new NotFoundError('User', request.params.id);
      }

      const updatedUser = await prisma.user.update({
        where: { id: request.params.id },
        data: { role: role as any },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      return reply.send(success(updatedUser));
    },
  );

  // ─── PUT /users/:id/status ───
  app.put<{ Params: { id: string }; Body: { status: string } }>(
    '/:id/status',
    { preHandler: [authorize('OWNER', 'ADMIN')] },
    async (request, reply) => {
      const { status } = request.body;

      const user = await prisma.user.findFirst({
        where: { id: request.params.id, tenantId: request.user!.tenantId },
      });

      if (!user) {
        throw new NotFoundError('User', request.params.id);
      }

      const updatedUser = await prisma.user.update({
        where: { id: request.params.id },
        data: { status: status as any },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      return reply.send(success(updatedUser));
    },
  );
}
