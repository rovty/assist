import { createLogger } from '@assist/shared-utils';
import { getRedis } from '../utils/redis.js';
import type { RecordUsageInput } from '../schemas/billing.schema.js';

const logger = createLogger('billing:usage');

/* ─── Keys ─────────────────────────────────────────────────── */

function usageKey(tenantId: string, metric: string, period: string) {
  return `billing:usage:${tenantId}:${metric}:${period}`;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/* ─── Record Usage ─────────────────────────────────────────── */

export async function recordUsage(tenantId: string, input: RecordUsageInput): Promise<number> {
  const redis = getRedis();
  const period = currentPeriod();
  const key = usageKey(tenantId, input.metric, period);

  const newValue = await redis.incrby(key, input.quantity);

  // Set TTL of 90 days on usage keys (cleanup old months)
  const ttl = await redis.ttl(key);
  if (ttl < 0) {
    await redis.expire(key, 90 * 24 * 60 * 60);
  }

  logger.debug({ tenantId, metric: input.metric, quantity: input.quantity, total: newValue }, 'Usage recorded');
  return newValue;
}

/* ─── Get Usage ────────────────────────────────────────────── */

export async function getUsage(
  tenantId: string,
  opts?: { metric?: string; period?: string },
): Promise<Record<string, number>> {
  const redis = getRedis();
  const period = opts?.period ?? currentPeriod();

  if (opts?.metric) {
    const value = await redis.get(usageKey(tenantId, opts.metric, period));
    return { [opts.metric]: Number(value ?? 0) };
  }

  // Get all metrics for tenant in period
  const pattern = `billing:usage:${tenantId}:*:${period}`;
  const keys = await redis.keys(pattern);

  const result: Record<string, number> = {};
  if (keys.length > 0) {
    const pipeline = redis.pipeline();
    for (const key of keys) {
      pipeline.get(key);
    }
    const values = await pipeline.exec();

    for (let i = 0; i < keys.length; i++) {
      const parts = keys[i].split(':');
      const metric = parts[3]; // billing:usage:tenantId:METRIC:period
      const [err, val] = values![i];
      if (!err) result[metric] = Number(val ?? 0);
    }
  }

  return result;
}

/* ─── Usage Limits ─────────────────────────────────────────── */

export const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free: { conversations: 100, messages: 1000, agents: 1 },
  starter: { conversations: 1000, messages: 10000, agents: 5 },
  professional: { conversations: 10000, messages: 100000, agents: 15 },
  enterprise: { conversations: Infinity, messages: Infinity, agents: Infinity },
};

export async function checkUsageLimit(
  tenantId: string,
  planId: string,
  metric: string,
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limits = PLAN_LIMITS[planId] ?? PLAN_LIMITS.free;
  const limit = limits[metric] ?? Infinity;
  const usage = await getUsage(tenantId, { metric });
  const current = usage[metric] ?? 0;

  return { allowed: current < limit, current, limit };
}
