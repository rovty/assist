import crypto from 'node:crypto';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';
import { redis } from '../utils/redis.js';

const logger = createLogger('webhook-service');

// ─── Signature Generation ───

export function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifySignature(payload: string, secret: string, signature: string): boolean {
  const expected = generateSignature(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// ─── Webhook Delivery ───

export async function deliverWebhook(config: {
  url: string;
  event: string;
  data: Record<string, unknown>;
  secret: string;
  webhookId: string;
}): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    event: config.event,
    data: config.data,
    timestamp,
    webhookId: config.webhookId,
  });

  const signature = generateSignature(body, config.secret);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-ID': config.webhookId,
        'X-Webhook-Event': config.event,
        'User-Agent': 'Assist-Webhook/1.0',
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      logger.info({ webhookId: config.webhookId, event: config.event, statusCode: response.status }, 'Webhook delivered');
      return { success: true, statusCode: response.status };
    }

    logger.warn({ webhookId: config.webhookId, statusCode: response.status }, 'Webhook delivery failed');
    return { success: false, statusCode: response.status, error: `HTTP ${response.status}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ webhookId: config.webhookId, err }, 'Webhook delivery error');
    return { success: false, error: message };
  }
}

// ─── Retry Logic ───

export async function deliverWithRetry(config: {
  url: string;
  event: string;
  data: Record<string, unknown>;
  secret: string;
  webhookId: string;
  tenantId: string;
}): Promise<{ success: boolean; attempts: number }> {
  let attempts = 0;

  while (attempts < env.WEBHOOK_MAX_RETRIES) {
    attempts++;
    const result = await deliverWebhook(config);

    if (result.success) {
      // Track success
      await redis.hincrby(`webhook:stats:${config.tenantId}`, 'delivered', 1);
      return { success: true, attempts };
    }

    // Exponential backoff: 1s, 2s, 4s
    if (attempts < env.WEBHOOK_MAX_RETRIES) {
      const delay = Math.pow(2, attempts - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Track failure
  await redis.hincrby(`webhook:stats:${config.tenantId}`, 'failed', 1);
  logger.error({ webhookId: config.webhookId, attempts }, 'Webhook delivery exhausted all retries');

  return { success: false, attempts };
}

// ─── Webhook Config Management (Redis) ───

const WEBHOOK_KEY_PREFIX = 'webhook:config:';

export interface WebhookRegistration {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
}

export async function registerWebhook(config: Omit<WebhookRegistration, 'id' | 'createdAt'>): Promise<WebhookRegistration> {
  const id = crypto.randomUUID();
  const webhook: WebhookRegistration = {
    ...config,
    id,
    createdAt: new Date().toISOString(),
  };

  await redis.hset(
    `${WEBHOOK_KEY_PREFIX}${config.tenantId}`,
    id,
    JSON.stringify(webhook),
  );

  logger.info({ webhookId: id, tenantId: config.tenantId }, 'Webhook registered');
  return webhook;
}

export async function getWebhooks(tenantId: string): Promise<WebhookRegistration[]> {
  const data = await redis.hgetall(`${WEBHOOK_KEY_PREFIX}${tenantId}`);
  return Object.values(data).map((v) => JSON.parse(v) as WebhookRegistration);
}

export async function getWebhook(tenantId: string, webhookId: string): Promise<WebhookRegistration | null> {
  const data = await redis.hget(`${WEBHOOK_KEY_PREFIX}${tenantId}`, webhookId);
  return data ? (JSON.parse(data) as WebhookRegistration) : null;
}

export async function updateWebhook(tenantId: string, webhookId: string, updates: Partial<Pick<WebhookRegistration, 'url' | 'events' | 'isActive'>>): Promise<WebhookRegistration | null> {
  const existing = await getWebhook(tenantId, webhookId);
  if (!existing) return null;

  const updated: WebhookRegistration = { ...existing, ...updates };
  await redis.hset(`${WEBHOOK_KEY_PREFIX}${tenantId}`, webhookId, JSON.stringify(updated));
  return updated;
}

export async function deleteWebhook(tenantId: string, webhookId: string): Promise<boolean> {
  const removed = await redis.hdel(`${WEBHOOK_KEY_PREFIX}${tenantId}`, webhookId);
  return removed > 0;
}

export async function getActiveWebhooksForEvent(tenantId: string, event: string): Promise<WebhookRegistration[]> {
  const webhooks = await getWebhooks(tenantId);
  return webhooks.filter((w) => w.isActive && (w.events.includes(event) || w.events.includes('*')));
}
