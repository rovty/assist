import { createLogger } from '@assist/shared-utils';
import type { NotificationChannel, NotificationType } from '@assist/shared-types';
import { redis } from '../utils/redis.js';
import { sendEmail } from './email.service.js';
import {
  conversationAssignedEmail,
  conversationEscalatedEmail,
  invitationEmail,
} from './email.service.js';
import { getActiveWebhooksForEvent, deliverWithRetry } from './webhook.service.js';

const logger = createLogger('notification-service');

// ─── Notification Record (stored in Redis) ───

interface NotificationRecord {
  id: string;
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  channel: string;
  type: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  status: string;
  sentAt?: string;
  createdAt: string;
}

const NOTIFICATION_KEY_PREFIX = 'notification:';

// ─── Core Send Function ───

export async function createNotification(params: {
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationRecord> {
  const id = crypto.randomUUID();
  const record: NotificationRecord = {
    id,
    tenantId: params.tenantId,
    recipientId: params.recipientId,
    recipientEmail: params.recipientEmail,
    channel: params.channel,
    type: params.type,
    subject: params.subject,
    body: params.body,
    metadata: params.metadata,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Store notification
  await redis.hset(
    `${NOTIFICATION_KEY_PREFIX}${params.tenantId}`,
    id,
    JSON.stringify(record),
  );

  // Add to recipient's list (recent 100)
  await redis.lpush(`${NOTIFICATION_KEY_PREFIX}user:${params.recipientId}`, id);
  await redis.ltrim(`${NOTIFICATION_KEY_PREFIX}user:${params.recipientId}`, 0, 99);

  return record;
}

async function updateNotificationStatus(tenantId: string, id: string, status: string): Promise<void> {
  const data = await redis.hget(`${NOTIFICATION_KEY_PREFIX}${tenantId}`, id);
  if (!data) return;

  const record = JSON.parse(data) as NotificationRecord;
  record.status = status;
  if (status === 'sent') record.sentAt = new Date().toISOString();

  await redis.hset(`${NOTIFICATION_KEY_PREFIX}${tenantId}`, id, JSON.stringify(record));
}

// ─── Notification Dispatch ───

export async function sendNotification(params: {
  tenantId: string;
  recipientId: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}): Promise<NotificationRecord> {
  const notification = await createNotification(params);

  try {
    switch (params.channel) {
      case 'email':
        if (!params.recipientEmail) {
          throw new Error('recipientEmail is required for email notifications');
        }
        await sendEmail({
          to: params.recipientEmail,
          subject: params.subject ?? params.type,
          html: params.body,
          text: params.body.replace(/<[^>]*>/g, ''),
        });
        break;

      case 'webhook': {
        const webhooks = await getActiveWebhooksForEvent(params.tenantId, params.type);
        await Promise.allSettled(
          webhooks.map((webhook) =>
            deliverWithRetry({
              url: webhook.url,
              event: params.type,
              data: {
                notificationId: notification.id,
                recipientId: params.recipientId,
                body: params.body,
                ...params.metadata,
              },
              secret: webhook.secret,
              webhookId: webhook.id,
              tenantId: params.tenantId,
            }),
          ),
        );
        break;
      }

      case 'in_app':
        // In-app notifications are stored via createNotification above
        // Real-time delivery happens via Socket.IO in conversation service
        break;

      case 'push':
        // Push notifications placeholder — integrate with FCM/APNs later
        logger.info({ notificationId: notification.id }, 'Push notification skipped — not yet implemented');
        break;
    }

    await updateNotificationStatus(params.tenantId, notification.id, 'sent');
    notification.status = 'sent';
  } catch (err) {
    logger.error({ err, notificationId: notification.id }, 'Failed to send notification');
    await updateNotificationStatus(params.tenantId, notification.id, 'failed');
    notification.status = 'failed';
  }

  return notification;
}

// ─── Event Handlers (called from Kafka consumer) ───

export async function handleConversationAssigned(data: {
  tenantId: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  contactName: string;
  dashboardUrl?: string;
}): Promise<void> {
  const emailData = conversationAssignedEmail({
    agentName: data.agentName,
    conversationId: data.conversationId,
    contactName: data.contactName,
    dashboardUrl: data.dashboardUrl ?? 'http://localhost:5173',
  });

  await sendNotification({
    tenantId: data.tenantId,
    recipientId: data.agentId,
    recipientEmail: data.agentEmail,
    channel: 'email' as NotificationChannel,
    type: 'conversation.assigned',
    subject: emailData.subject,
    body: emailData.html,
  });

  // Also fire webhooks
  const webhooks = await getActiveWebhooksForEvent(data.tenantId, 'conversation.assigned');
  await Promise.allSettled(
    webhooks.map((wh) =>
      deliverWithRetry({
        url: wh.url,
        event: 'conversation.assigned',
        data: {
          conversationId: data.conversationId,
          agentId: data.agentId,
          contactName: data.contactName,
        },
        secret: wh.secret,
        webhookId: wh.id,
        tenantId: data.tenantId,
      }),
    ),
  );
}

export async function handleConversationEscalated(data: {
  tenantId: string;
  conversationId: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  contactName: string;
  reason: string;
  dashboardUrl?: string;
}): Promise<void> {
  const emailData = conversationEscalatedEmail({
    agentName: data.agentName,
    conversationId: data.conversationId,
    contactName: data.contactName,
    reason: data.reason,
    dashboardUrl: data.dashboardUrl ?? 'http://localhost:5173',
  });

  await sendNotification({
    tenantId: data.tenantId,
    recipientId: data.agentId,
    recipientEmail: data.agentEmail,
    channel: 'email' as NotificationChannel,
    type: 'conversation.escalated',
    subject: emailData.subject,
    body: emailData.html,
  });
}

export async function handleInvitation(data: {
  tenantId: string;
  recipientEmail: string;
  recipientId: string;
  inviterName: string;
  tenantName: string;
  inviteUrl: string;
}): Promise<void> {
  const emailData = invitationEmail({
    inviterName: data.inviterName,
    tenantName: data.tenantName,
    inviteUrl: data.inviteUrl,
  });

  await sendNotification({
    tenantId: data.tenantId,
    recipientId: data.recipientId,
    recipientEmail: data.recipientEmail,
    channel: 'email' as NotificationChannel,
    type: 'invitation.received',
    subject: emailData.subject,
    body: emailData.html,
  });
}

// ─── Query ───

export async function getNotifications(tenantId: string, limit = 50): Promise<NotificationRecord[]> {
  const data = await redis.hgetall(`${NOTIFICATION_KEY_PREFIX}${tenantId}`);
  return Object.values(data)
    .map((v) => JSON.parse(v) as NotificationRecord)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function getUserNotifications(recipientId: string, limit = 20): Promise<string[]> {
  return redis.lrange(`${NOTIFICATION_KEY_PREFIX}user:${recipientId}`, 0, limit - 1);
}

export async function getNotification(tenantId: string, id: string): Promise<NotificationRecord | null> {
  const data = await redis.hget(`${NOTIFICATION_KEY_PREFIX}${tenantId}`, id);
  return data ? (JSON.parse(data) as NotificationRecord) : null;
}
