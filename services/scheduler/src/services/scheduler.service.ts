import { createLogger, generateId } from '@assist/shared-utils';
import { redis } from '../utils/redis.js';
import type { CreateJob, UpdateJob, CreateSLA, UpdateSLA, BusinessHoursConfig } from '../schemas/scheduler.schema.js';

const logger = createLogger('scheduler:service');

/* ── Key helpers ─────────────────────────────────────────── */

const KEYS = {
  job: (tenantId: string, id: string) => `scheduler:job:${tenantId}:${id}`,
  jobList: (tenantId: string) => `scheduler:jobs:${tenantId}`,
  jobQueue: () => `scheduler:queue`,
  sla: (tenantId: string, id: string) => `scheduler:sla:${tenantId}:${id}`,
  slaList: (tenantId: string) => `scheduler:slas:${tenantId}`,
  businessHours: (tenantId: string) => `scheduler:business-hours:${tenantId}`,
};

/* ── Job CRUD ────────────────────────────────────────────── */

export async function createJob(tenantId: string, userId: string, data: CreateJob) {
  const id = generateId('job');
  const now = new Date().toISOString();

  const job = {
    id,
    tenantId,
    type: data.type,
    name: data.name,
    cronExpression: data.cronExpression,
    config: data.config,
    status: data.enabled ? 'active' : 'paused',
    lastRunAt: null,
    nextRunAt: calculateNextRun(data.cronExpression),
    runCount: 0,
    failCount: 0,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(KEYS.job(tenantId, id), JSON.stringify(job));
  await redis.sadd(KEYS.jobList(tenantId), id);

  // Add to execution queue if active
  if (job.status === 'active' && job.nextRunAt) {
    await redis.zadd(KEYS.jobQueue(), new Date(job.nextRunAt).getTime(), JSON.stringify({ tenantId, jobId: id }));
  }

  logger.info({ jobId: id, type: data.type }, 'Job created');
  return job;
}

export async function getJob(tenantId: string, jobId: string) {
  const raw = await redis.get(KEYS.job(tenantId, jobId));
  return raw ? JSON.parse(raw) : null;
}

export async function listJobs(
  tenantId: string,
  opts: { type?: string; status?: string; page: number; limit: number },
) {
  const ids = await redis.smembers(KEYS.jobList(tenantId));
  if (!ids.length) return { data: [], total: 0, page: opts.page, limit: opts.limit };

  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get(KEYS.job(tenantId, id));
  const results = await pipeline.exec();

  let jobs = (results || [])
    .map(([_, val]) => (val ? JSON.parse(val as string) : null))
    .filter(Boolean);

  if (opts.type) jobs = jobs.filter((j: any) => j.type === opts.type);
  if (opts.status) jobs = jobs.filter((j: any) => j.status === opts.status);

  jobs.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  const total = jobs.length;
  const start = (opts.page - 1) * opts.limit;
  const paged = jobs.slice(start, start + opts.limit);

  return { data: paged, total, page: opts.page, limit: opts.limit };
}

export async function updateJob(tenantId: string, jobId: string, data: UpdateJob) {
  const existing = await getJob(tenantId, jobId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
    config: data.config !== undefined ? data.config : existing.config,
    nextRunAt: data.cronExpression ? calculateNextRun(data.cronExpression) : existing.nextRunAt,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(KEYS.job(tenantId, jobId), JSON.stringify(updated));
  return updated;
}

export async function deleteJob(tenantId: string, jobId: string) {
  await redis.del(KEYS.job(tenantId, jobId));
  await redis.srem(KEYS.jobList(tenantId), jobId);
  return true;
}

export async function pauseJob(tenantId: string, jobId: string) {
  const job = await getJob(tenantId, jobId);
  if (!job || job.status !== 'active') return null;

  job.status = 'paused';
  job.updatedAt = new Date().toISOString();
  await redis.set(KEYS.job(tenantId, jobId), JSON.stringify(job));
  return job;
}

export async function resumeJob(tenantId: string, jobId: string) {
  const job = await getJob(tenantId, jobId);
  if (!job || job.status !== 'paused') return null;

  job.status = 'active';
  job.nextRunAt = calculateNextRun(job.cronExpression);
  job.updatedAt = new Date().toISOString();
  await redis.set(KEYS.job(tenantId, jobId), JSON.stringify(job));

  if (job.nextRunAt) {
    await redis.zadd(KEYS.jobQueue(), new Date(job.nextRunAt).getTime(), JSON.stringify({ tenantId, jobId }));
  }

  return job;
}

export async function markJobExecuted(tenantId: string, jobId: string, success: boolean) {
  const job = await getJob(tenantId, jobId);
  if (!job) return;

  job.lastRunAt = new Date().toISOString();
  job.runCount += 1;
  if (!success) job.failCount += 1;
  job.nextRunAt = calculateNextRun(job.cronExpression);
  job.updatedAt = new Date().toISOString();

  await redis.set(KEYS.job(tenantId, jobId), JSON.stringify(job));

  // Re-queue if still active
  if (job.status === 'active' && job.nextRunAt) {
    await redis.zadd(KEYS.jobQueue(), new Date(job.nextRunAt).getTime(), JSON.stringify({ tenantId, jobId }));
  }
}

/* ── SLA CRUD ────────────────────────────────────────────── */

export async function createSLA(tenantId: string, userId: string, data: CreateSLA) {
  const id = generateId('sla');
  const now = new Date().toISOString();

  const sla = {
    id,
    tenantId,
    name: data.name,
    description: data.description || '',
    targets: data.targets,
    enabled: data.enabled,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(KEYS.sla(tenantId, id), JSON.stringify(sla));
  await redis.sadd(KEYS.slaList(tenantId), id);

  logger.info({ slaId: id }, 'SLA policy created');
  return sla;
}

export async function getSLA(tenantId: string, slaId: string) {
  const raw = await redis.get(KEYS.sla(tenantId, slaId));
  return raw ? JSON.parse(raw) : null;
}

export async function listSLAs(tenantId: string) {
  const ids = await redis.smembers(KEYS.slaList(tenantId));
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) pipeline.get(KEYS.sla(tenantId, id));
  const results = await pipeline.exec();

  return (results || [])
    .map(([_, val]) => (val ? JSON.parse(val as string) : null))
    .filter(Boolean);
}

export async function updateSLA(tenantId: string, slaId: string, data: UpdateSLA) {
  const existing = await getSLA(tenantId, slaId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...data,
    targets: data.targets ? { ...existing.targets, ...data.targets } : existing.targets,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(KEYS.sla(tenantId, slaId), JSON.stringify(updated));
  return updated;
}

export async function deleteSLA(tenantId: string, slaId: string) {
  await redis.del(KEYS.sla(tenantId, slaId));
  await redis.srem(KEYS.slaList(tenantId), slaId);
  return true;
}

/* ── Business Hours ──────────────────────────────────────── */

export async function setBusinessHours(tenantId: string, data: BusinessHoursConfig) {
  await redis.set(KEYS.businessHours(tenantId), JSON.stringify(data));
  return data;
}

export async function getBusinessHours(tenantId: string) {
  const raw = await redis.get(KEYS.businessHours(tenantId));
  return raw ? JSON.parse(raw) : null;
}

export function isWithinBusinessHours(config: BusinessHoursConfig): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[now.getDay()];

  const daySchedule = config.schedule[dayName];
  if (!daySchedule || !daySchedule.enabled) return false;

  // Simple time comparison (HH:MM format)
  const currentTime = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: config.timezone,
  });

  return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
}

/* ── Helpers ─────────────────────────────────────────────── */

function calculateNextRun(cronExpression: string): string | null {
  // Simple cron parser for common patterns
  // In production, use a library like cron-parser
  const now = Date.now();
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) return null;

  // Simple interval: */N * * * * → every N minutes
  const minutePart = parts[0];
  if (minutePart.startsWith('*/')) {
    const minutes = parseInt(minutePart.slice(2), 10);
    if (!isNaN(minutes) && minutes > 0) {
      return new Date(now + minutes * 60 * 1000).toISOString();
    }
  }

  // Default: 5 minutes from now
  return new Date(now + 5 * 60 * 1000).toISOString();
}
