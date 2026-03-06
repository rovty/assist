// ─── Notification Types ───
export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface Notification {
  id: string;
  tenantId: string;
  recipientId: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  status: NotificationStatus;
  sentAt?: Date;
  createdAt: Date;
}

export type NotificationType =
  | 'conversation.new'
  | 'conversation.assigned'
  | 'conversation.escalated'
  | 'message.new'
  | 'invitation.received'
  | 'invitation.accepted'
  | 'system.alert'
  | 'usage.limit_warning'
  | 'usage.limit_reached';

export interface WebhookConfig {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface WebhookPayload {
  webhookId: string;
  url: string;
  event: string;
  data: Record<string, unknown>;
  signature: string;
  timestamp: string;
}
