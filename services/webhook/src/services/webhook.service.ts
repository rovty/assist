import crypto from 'node:crypto';
import { createLogger, generateId } from '@assist/shared-utils';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import type { CreateEndpoint, UpdateEndpoint } from '../schemas/webhook.schema.js';

const logger = createLogger('webhook:service');

/* ── Key helpers ─────────────────────────────────────────── */

const KEYS = {
  endpoint: (tenantId: string, id: string) => `webhook:endpoint:${tenantId}:${id}`,
  endpointList: (tenantId: string) => `webhook:endpoints:${tenantId}`,
  delivery: (tenantId: string, endpointId: string, id: string) => `webhook:delivery:${tenantId}:${endpointId}:${id}`,
  deliveryList: (tenantId: string, endpointId: string) => `webhook:deliveries:${tenantId}:${endpointId}`,
  stats: (tenantId: string, endpointId: string) => `webhook:stats:${tenantId}:${endpointId}`,
};

/* ── Endpoint CRUD ───────────────────────────────────────── */

export async function createEndpoint(tenantId: string, userId: string, data: CreateEndpoint) {
  const id = generateId('whep');
  const now = new Date().toISOString();
  const secret = data.secret || `whsec_${crypto.randomBytes(24).toString('hex')}`;

  const endpoint = {
    id,
    tenantId,
    url: data.url,
    events: data.events,
    description: data.description || '',
    secret,
    retryPolicy: {
      maxRetries: data.retryPolicy?.maxRetries ?? env.WEBHOOK_MAX_RETRIES,
      backoffMs: data.retryPolicy?.backoffMs ?? env.WEBHOOK_RETRY_BACKOFF_MS,
    },
    headers: data.headers || {},
    enabled: data.enabled,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(KEYS.endpoint(tenantId, id), JSON.stringify(endpoint));
  await redis.sadd(KEYS.endpointList(tenantId), id);

  logger.info({ endpointId: id, url: data.url }, 'Webhook endpoint created');
  return endpoint;
}

export async function getEndpoint(tenantId: string, endpointId: string) {
  const raw = await redis.get(KEYS.endpoint(tenantId, endpointId));
  return raw ? JSON.parse(raw) : null;
}

export async function listEndpoints(
  tenantId: string,
  opts: { event?: string; enabled?: boolean; page: number; limit: number },
) {
  const ids = await redis.smembers(KEYS.endpointList(tenantId));
  if (!ids.length) return { data: [], total: 0, page: opts.page, limit: opts.limit };

  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get(KEYS.endpoint(tenantId, id));
  const results = await pipeline.exec();

  let endpoints = (results || [])
    .map(([_, val]) => (val ? JSON.parse(val as string) : null))
    .filter(Boolean);

  if (opts.event) {
    endpoints = endpoints.filter((ep: any) => ep.events.includes(opts.event));
  }
  if (opts.enabled !== undefined) {
    endpoints = endpoints.filter((ep: any) => ep.enabled === opts.enabled);
  }

  endpoints.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  const total = endpoints.length;
  const start = (opts.page - 1) * opts.limit;
  const paged = endpoints.slice(start, start + opts.limit);

  return { data: paged, total, page: opts.page, limit: opts.limit };
}

export async function updateEndpoint(tenantId: string, endpointId: string, data: UpdateEndpoint) {
  const existing = await getEndpoint(tenantId, endpointId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
    retryPolicy: data.retryPolicy
      ? { ...existing.retryPolicy, ...data.retryPolicy }
      : existing.retryPolicy,
    headers: data.headers !== undefined ? data.headers : existing.headers,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(KEYS.endpoint(tenantId, endpointId), JSON.stringify(updated));
  return updated;
}

export async function deleteEndpoint(tenantId: string, endpointId: string) {
  await redis.del(KEYS.endpoint(tenantId, endpointId));
  await redis.srem(KEYS.endpointList(tenantId), endpointId);
  // Clean up deliveries
  const deliveryIds = await redis.lrange(KEYS.deliveryList(tenantId, endpointId), 0, -1);
  if (deliveryIds.length) {
    const pipeline = redis.pipeline();
    for (const did of deliveryIds) pipeline.del(KEYS.delivery(tenantId, endpointId, did));
    pipeline.del(KEYS.deliveryList(tenantId, endpointId));
    pipeline.del(KEYS.stats(tenantId, endpointId));
    await pipeline.exec();
  }
  return true;
}

/* ── Delivery ────────────────────────────────────────────── */

export async function deliverWebhook(
  tenantId: string,
  endpointId: string,
  eventType: string,
  payload: Record<string, unknown>,
) {
  const endpoint = await getEndpoint(tenantId, endpointId);
  if (!endpoint || !endpoint.enabled) return null;

  const deliveryId = generateId('whdl');
  const timestamp = Date.now();
  const body = JSON.stringify({
    id: deliveryId,
    event: eventType,
    timestamp,
    data: payload,
  });

  // Generate signature
  const signature = crypto
    .createHmac('sha256', endpoint.secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  const delivery: Record<string, any> = {
    id: deliveryId,
    endpointId,
    eventType,
    status: 'pending',
    attempts: 0,
    maxAttempts: endpoint.retryPolicy.maxRetries + 1,
    request: { url: endpoint.url, body, headers: endpoint.headers },
    response: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  // Attempt delivery
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Id': deliveryId,
        'X-Webhook-Timestamp': String(timestamp),
        'X-Webhook-Signature': `sha256=${signature}`,
        'User-Agent': 'Assist-Webhook/1.0',
        ...endpoint.headers,
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    delivery.attempts = 1;
    delivery.response = {
      status: res.status,
      statusText: res.statusText,
      body: (await res.text()).slice(0, 1024),
    };

    if (res.ok) {
      delivery.status = 'success';
      delivery.completedAt = new Date().toISOString();
      await incrStats(tenantId, endpointId, 'success');
    } else {
      delivery.status = 'failed';
      delivery.completedAt = new Date().toISOString();
      await incrStats(tenantId, endpointId, 'failed');
      // Queue for retry if within limit
      if (delivery.attempts < delivery.maxAttempts) {
        await queueRetry(tenantId, endpointId, deliveryId, endpoint.retryPolicy.backoffMs);
      }
    }
  } catch (err: any) {
    delivery.attempts = 1;
    delivery.status = 'failed';
    delivery.response = { error: err.message || 'Request failed' };
    delivery.completedAt = new Date().toISOString();
    await incrStats(tenantId, endpointId, 'failed');

    if (delivery.attempts < delivery.maxAttempts) {
      await queueRetry(tenantId, endpointId, deliveryId, endpoint.retryPolicy.backoffMs);
    }
  }

  // Persist delivery log
  await redis.set(KEYS.delivery(tenantId, endpointId, deliveryId), JSON.stringify(delivery), 'EX', 604800); // 7d TTL
  await redis.lpush(KEYS.deliveryList(tenantId, endpointId), deliveryId);
  await redis.ltrim(KEYS.deliveryList(tenantId, endpointId), 0, 499); // Keep last 500

  return delivery;
}

export async function retryDelivery(tenantId: string, endpointId: string, deliveryId: string) {
  const raw = await redis.get(KEYS.delivery(tenantId, endpointId, deliveryId));
  if (!raw) return null;

  const delivery = JSON.parse(raw);
  if (delivery.status === 'success') return delivery; // Already delivered

  const endpoint = await getEndpoint(tenantId, endpointId);
  if (!endpoint) return null;

  // Re-deliver
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', endpoint.secret)
    .update(`${timestamp}.${delivery.request.body}`)
    .digest('hex');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.WEBHOOK_TIMEOUT_MS);

    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Id': deliveryId,
        'X-Webhook-Timestamp': String(timestamp),
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Retry': String(delivery.attempts),
        'User-Agent': 'Assist-Webhook/1.0',
        ...endpoint.headers,
      },
      body: delivery.request.body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    delivery.attempts += 1;
    delivery.response = {
      status: res.status,
      statusText: res.statusText,
      body: (await res.text()).slice(0, 1024),
    };

    delivery.status = res.ok ? 'success' : 'failed';
    delivery.completedAt = new Date().toISOString();
    await incrStats(tenantId, endpointId, delivery.status);
  } catch (err: any) {
    delivery.attempts += 1;
    delivery.response = { error: err.message || 'Retry failed' };
    delivery.status = 'failed';
    delivery.completedAt = new Date().toISOString();
    await incrStats(tenantId, endpointId, 'failed');
  }

  await redis.set(KEYS.delivery(tenantId, endpointId, deliveryId), JSON.stringify(delivery), 'EX', 604800);
  return delivery;
}

export async function listDeliveries(
  tenantId: string,
  endpointId: string,
  opts: { status?: string; page: number; limit: number },
) {
  const start = (opts.page - 1) * opts.limit;
  const end = start + opts.limit - 1;

  const ids = await redis.lrange(KEYS.deliveryList(tenantId, endpointId), 0, 499);
  if (!ids.length) return { data: [], total: 0, page: opts.page, limit: opts.limit };

  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get(KEYS.delivery(tenantId, endpointId, id));
  const results = await pipeline.exec();

  let deliveries = (results || [])
    .map(([_, val]) => (val ? JSON.parse(val as string) : null))
    .filter(Boolean);

  if (opts.status) {
    deliveries = deliveries.filter((d: any) => d.status === opts.status);
  }

  const total = deliveries.length;
  const paged = deliveries.slice(start, start + opts.limit);

  return { data: paged, total, page: opts.page, limit: opts.limit };
}

export async function getEndpointStats(tenantId: string, endpointId: string) {
  const raw = await redis.hgetall(KEYS.stats(tenantId, endpointId));
  return {
    totalDeliveries: parseInt(raw.total || '0', 10),
    successful: parseInt(raw.success || '0', 10),
    failed: parseInt(raw.failed || '0', 10),
    lastDeliveryAt: raw.lastDeliveryAt || null,
  };
}

/* ── Dispatch to all matching endpoints ──────────────────── */

export async function dispatchEvent(tenantId: string, eventType: string, payload: Record<string, unknown>) {
  const { data: endpoints } = await listEndpoints(tenantId, {
    event: eventType,
    enabled: true,
    page: 1,
    limit: 100,
  });

  const deliveries = await Promise.allSettled(
    endpoints.map((ep: any) => deliverWebhook(tenantId, ep.id, eventType, payload)),
  );

  const results = deliveries.map((d, i) => ({
    endpointId: endpoints[i].id,
    status: d.status === 'fulfilled' ? (d.value?.status || 'skipped') : 'error',
  }));

  logger.info({ eventType, endpointsMatched: endpoints.length }, 'Webhook event dispatched');
  return results;
}

/* ── Internal helpers ────────────────────────────────────── */

async function incrStats(tenantId: string, endpointId: string, status: 'success' | 'failed') {
  const key = KEYS.stats(tenantId, endpointId);
  await redis.hincrby(key, 'total', 1);
  await redis.hincrby(key, status, 1);
  await redis.hset(key, 'lastDeliveryAt', new Date().toISOString());
}

async function queueRetry(tenantId: string, endpointId: string, deliveryId: string, backoffMs: number) {
  // Simple delayed retry using Redis sorted set (score = execution timestamp)
  const executeAt = Date.now() + backoffMs;
  await redis.zadd(
    'webhook:retry:queue',
    executeAt,
    JSON.stringify({ tenantId, endpointId, deliveryId }),
  );
  logger.info({ deliveryId, executeAt: new Date(executeAt).toISOString() }, 'Queued webhook retry');
}
