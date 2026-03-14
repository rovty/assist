import { createLogger, generateId } from '@assist/shared-utils';
import { getRedis } from '../utils/redis.js';
import type { CreateCannedInput, UpdateCannedInput } from '../schemas/workspace.schema.js';

const logger = createLogger('agent-workspace:canned');

/* ─── Keys ─────────────────────────────────────────────────── */

function cannedKey(tenantId: string, id: string) {
  return `workspace:canned:${tenantId}:${id}`;
}

function cannedIndexKey(tenantId: string) {
  return `workspace:cannedIdx:${tenantId}`;
}

function shortcutKey(tenantId: string, shortcut: string) {
  return `workspace:shortcut:${tenantId}:${shortcut}`;
}

/* ─── Types ────────────────────────────────────────────────── */

export interface CannedResponse {
  id: string;
  tenantId: string;
  shortcut: string;
  title: string;
  content: string;
  category?: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── CRUD ─────────────────────────────────────────────────── */

export async function createCannedResponse(
  tenantId: string,
  userId: string,
  input: CreateCannedInput,
): Promise<CannedResponse> {
  const redis = getRedis();
  const id = generateId('cr');
  const now = new Date().toISOString();

  // Check shortcut uniqueness
  const existing = await redis.get(shortcutKey(tenantId, input.shortcut));
  if (existing) {
    throw Object.assign(new Error(`Shortcut "${input.shortcut}" already exists`), { statusCode: 409 });
  }

  const response: CannedResponse = {
    id,
    tenantId,
    shortcut: input.shortcut,
    title: input.title,
    content: input.content,
    category: input.category,
    isGlobal: input.isGlobal,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await redis
    .multi()
    .set(cannedKey(tenantId, id), JSON.stringify(response))
    .sadd(cannedIndexKey(tenantId), id)
    .set(shortcutKey(tenantId, input.shortcut), id)
    .exec();

  logger.info({ tenantId, id, shortcut: input.shortcut }, 'Canned response created');
  return response;
}

export async function getCannedResponse(tenantId: string, id: string): Promise<CannedResponse | null> {
  const redis = getRedis();
  const raw = await redis.get(cannedKey(tenantId, id));
  return raw ? JSON.parse(raw) : null;
}

export async function getCannedByShortcut(tenantId: string, shortcut: string): Promise<CannedResponse | null> {
  const redis = getRedis();
  const id = await redis.get(shortcutKey(tenantId, shortcut));
  if (!id) return null;
  return getCannedResponse(tenantId, id);
}

export async function listCannedResponses(
  tenantId: string,
  opts?: { q?: string; category?: string },
): Promise<CannedResponse[]> {
  const redis = getRedis();
  const ids = await redis.smembers(cannedIndexKey(tenantId));

  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(cannedKey(tenantId, id));
  }
  const results = await pipeline.exec();

  let items: CannedResponse[] = [];
  if (results) {
    for (const [err, raw] of results) {
      if (!err && raw) items.push(JSON.parse(raw as string));
    }
  }

  if (opts?.category) {
    items = items.filter((r) => r.category === opts.category);
  }

  if (opts?.q) {
    const query = opts.q.toLowerCase();
    items = items.filter(
      (r) =>
        r.shortcut.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query),
    );
  }

  items.sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  return items;
}

export async function updateCannedResponse(
  tenantId: string,
  id: string,
  input: UpdateCannedInput,
): Promise<CannedResponse | null> {
  const redis = getRedis();
  const existing = await getCannedResponse(tenantId, id);
  if (!existing) return null;

  // If shortcut is changing, check uniqueness and update mapping
  if (input.shortcut && input.shortcut !== existing.shortcut) {
    const conflict = await redis.get(shortcutKey(tenantId, input.shortcut));
    if (conflict) {
      throw Object.assign(new Error(`Shortcut "${input.shortcut}" already exists`), { statusCode: 409 });
    }
    await redis.del(shortcutKey(tenantId, existing.shortcut));
    await redis.set(shortcutKey(tenantId, input.shortcut), id);
  }

  const updated: CannedResponse = {
    ...existing,
    shortcut: input.shortcut ?? existing.shortcut,
    title: input.title ?? existing.title,
    content: input.content ?? existing.content,
    category: input.category !== undefined ? input.category : existing.category,
    isGlobal: input.isGlobal ?? existing.isGlobal,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(cannedKey(tenantId, id), JSON.stringify(updated));
  logger.info({ tenantId, id }, 'Canned response updated');
  return updated;
}

export async function deleteCannedResponse(tenantId: string, id: string): Promise<boolean> {
  const redis = getRedis();
  const existing = await getCannedResponse(tenantId, id);
  if (!existing) return false;

  await redis
    .multi()
    .del(cannedKey(tenantId, id))
    .srem(cannedIndexKey(tenantId), id)
    .del(shortcutKey(tenantId, existing.shortcut))
    .exec();

  logger.info({ tenantId, id }, 'Canned response deleted');
  return true;
}
