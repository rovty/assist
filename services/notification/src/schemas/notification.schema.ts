import { z } from 'zod';

export const sendNotificationSchema = z.object({
  recipientId: z.string().min(1),
  recipientEmail: z.string().email().optional(),
  channel: z.enum(['email', 'push', 'webhook', 'in_app']),
  type: z.enum([
    'conversation.new',
    'conversation.assigned',
    'conversation.escalated',
    'message.new',
    'invitation.received',
    'invitation.accepted',
    'system.alert',
    'usage.limit_warning',
    'usage.limit_reached',
  ]),
  subject: z.string().optional(),
  body: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export const registerWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().min(16).optional(), // Auto-generate if not provided
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const listNotificationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type RegisterWebhookInput = z.infer<typeof registerWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
