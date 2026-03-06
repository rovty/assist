import type { FastifyInstance } from 'fastify';
import { extractTenantContext, requireRole } from '../middleware/auth.js';
import {
  sendNotificationSchema,
  listNotificationsSchema,
} from '../schemas/notification.schema.js';
import {
  sendNotification,
  getNotifications,
  getNotification,
  getUserNotifications,
} from '../services/notification.service.js';
import type { NotificationChannel, NotificationType } from '@assist/shared-types';

export async function notificationRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', extractTenantContext);

  // ─── Send Notification ───
  app.post('/', async (request, reply) => {
    const body = sendNotificationSchema.parse(request.body);

    const result = await sendNotification({
      tenantId: request.tenantContext.tenantId,
      recipientId: body.recipientId,
      recipientEmail: body.recipientEmail,
      channel: body.channel as NotificationChannel,
      type: body.type as NotificationType,
      subject: body.subject,
      body: body.body,
      metadata: body.metadata,
    });

    reply.code(201).send({ data: result });
  });

  // ─── List Notifications (tenant-wide, admin only) ───
  app.get('/', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const query = listNotificationsSchema.parse(request.query);
    const notifications = await getNotifications(request.tenantContext.tenantId, query.limit);
    reply.send({ data: notifications, count: notifications.length });
  });

  // ─── Get User's Notifications ───
  app.get('/me', async (request, reply) => {
    const ids = await getUserNotifications(request.tenantContext.userId);
    reply.send({ data: ids });
  });

  // ─── Get Notification by ID ───
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const notification = await getNotification(request.tenantContext.tenantId, request.params.id);
    if (!notification) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Notification not found' });
      return;
    }
    reply.send({ data: notification });
  });
}
