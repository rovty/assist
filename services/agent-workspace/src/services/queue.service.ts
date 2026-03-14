import { createLogger } from '@assist/shared-utils';
import { generateId } from '@assist/shared-utils';
import { getRedis } from '../utils/redis.js';
import type { EnqueueInput } from '../schemas/workspace.schema.js';

const logger = createLogger('agent-workspace:queue');

/* Priority weights for sorted set scoring – lower = higher priority */
const PRIORITY_SCORES: Record<string, number> = {
  urgent: 0,
  high: 1_000_000,
  normal: 2_000_000,
  low: 3_000_000,
};

function queueKey(tenantId: string) {
  return `workspace:queue:${tenantId}`;
}

function itemKey(tenantId: string, itemId: string) {
  return `workspace:queueItem:${tenantId}:${itemId}`;
}

export interface QueueItem {
  id: string;
  tenantId: string;
  conversationId: string;
  channel: string;
  priority: string;
  skills: string[];
  metadata: Record<string, unknown>;
  status: 'waiting' | 'assigned' | 'resolved';
  assignedTo?: string;
  enqueuedAt: string;
  assignedAt?: string;
}

/* ─── Enqueue ──────────────────────────────────────────────── */

export async function enqueue(tenantId: string, input: EnqueueInput): Promise<QueueItem> {
  const redis = getRedis();
  const id = generateId('qi');
  const now = Date.now();

  // Score = priority bucket + timestamp for FIFO within each priority
  const score = PRIORITY_SCORES[input.priority] + now;

  const item: QueueItem = {
    id,
    tenantId,
    conversationId: input.conversationId,
    channel: input.channel,
    priority: input.priority,
    skills: input.skills,
    metadata: input.metadata ?? {},
    status: 'waiting',
    enqueuedAt: new Date(now).toISOString(),
  };

  await redis
    .multi()
    .set(itemKey(tenantId, id), JSON.stringify(item))
    .zadd(queueKey(tenantId), score, id)
    .exec();

  logger.info({ tenantId, itemId: id, priority: input.priority }, 'Enqueued conversation');
  return item;
}

/* ─── Dequeue (pop highest-priority item) ─────────────────── */

export async function dequeue(tenantId: string, agentId: string): Promise<QueueItem | null> {
  const redis = getRedis();
  const key = queueKey(tenantId);

  // Pop the lowest-score (highest-priority) member
  const results = await redis.zpopmin(key, 1);
  if (!results || results.length === 0) return null;

  const itemId = results[0];
  const raw = await redis.get(itemKey(tenantId, itemId));
  if (!raw) return null;

  const item: QueueItem = JSON.parse(raw);
  item.status = 'assigned';
  item.assignedTo = agentId;
  item.assignedAt = new Date().toISOString();

  await redis.set(itemKey(tenantId, itemId), JSON.stringify(item));
  logger.info({ tenantId, itemId, agentId }, 'Dequeued and assigned');
  return item;
}

/* ─── Get Queue Item ───────────────────────────────────────── */

export async function getQueueItem(tenantId: string, itemId: string): Promise<QueueItem | null> {
  const redis = getRedis();
  const raw = await redis.get(itemKey(tenantId, itemId));
  return raw ? JSON.parse(raw) : null;
}

/* ─── Remove from queue ────────────────────────────────────── */

export async function removeFromQueue(tenantId: string, itemId: string): Promise<boolean> {
  const redis = getRedis();
  await redis.zrem(queueKey(tenantId), itemId);
  const deleted = await redis.del(itemKey(tenantId, itemId));
  return deleted > 0;
}

/* ─── List queue ───────────────────────────────────────────── */

export async function listQueue(tenantId: string): Promise<QueueItem[]> {
  const redis = getRedis();
  const ids = await redis.zrange(queueKey(tenantId), 0, -1);

  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(itemKey(tenantId, id));
  }
  const results = await pipeline.exec();

  const items: QueueItem[] = [];
  if (results) {
    for (const [err, raw] of results) {
      if (!err && raw) items.push(JSON.parse(raw as string));
    }
  }
  return items;
}

/* ─── Queue stats ──────────────────────────────────────────── */

export async function getQueueStats(tenantId: string) {
  const redis = getRedis();
  const total = await redis.zcard(queueKey(tenantId));
  return { tenantId, waiting: total };
}
