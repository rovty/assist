// ─── Webhook Types (dedicated service) ───

export enum WebhookEventCategory {
  CONVERSATION = 'conversation',
  MESSAGE = 'message',
  CONTACT = 'contact',
  AI = 'ai',
  CHANNEL = 'channel',
  KNOWLEDGE_BASE = 'knowledge_base',
}

export interface WebhookEndpoint {
  id: string;
  tenantId: string;
  url: string;
  description?: string;
  events: string[];
  secret: string;
  isActive: boolean;
  version: string;
  headers?: Record<string, string>;
  retryPolicy: RetryPolicy;
  stats: WebhookStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface WebhookStats {
  totalDelivered: number;
  totalFailed: number;
  lastDeliveredAt?: Date;
  lastFailedAt?: Date;
  avgResponseTimeMs: number;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  tenantId: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  httpStatus?: number;
  responseBody?: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  deliveryId: string;
  tenantId: string;
  event: string;
  requestUrl: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  responseStatus?: number;
  responseBody?: string;
  responseTimeMs: number;
  success: boolean;
  error?: string;
  attempt: number;
  createdAt: Date;
}

// All supported webhook events
export const WEBHOOK_EVENTS = [
  'conversation.created',
  'conversation.assigned',
  'conversation.resolved',
  'conversation.closed',
  'conversation.escalated',
  'message.sent',
  'message.received',
  'contact.created',
  'contact.updated',
  'ai.response_generated',
  'ai.escalation_triggered',
  'channel.connected',
  'channel.disconnected',
  'knowledge_base.source_ready',
  'knowledge_base.source_failed',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENTS)[number];
