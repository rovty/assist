import { createLogger } from '@assist/shared-utils';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import { markJobExecuted } from './scheduler.service.js';

const logger = createLogger('scheduler:cron');

const JOB_QUEUE_KEY = 'scheduler:queue';
let tickInterval: ReturnType<typeof setInterval> | null = null;

export function startTickLoop() {
  if (tickInterval) return;

  tickInterval = setInterval(async () => {
    try {
      await processDueJobs();
    } catch (err) {
      logger.error(err, 'Tick loop error');
    }
  }, env.TICK_INTERVAL_MS);

  logger.info('Cron tick loop started');
}

export function stopTickLoop() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
    logger.info('Cron tick loop stopped');
  }
}

async function processDueJobs() {
  const now = Date.now();

  // Get all due jobs (score <= now)
  const dueItems = await redis.zrangebyscore(JOB_QUEUE_KEY, 0, now);
  if (!dueItems.length) return;

  for (const item of dueItems) {
    try {
      const { tenantId, jobId } = JSON.parse(item);

      // Remove from queue first (prevents double execution)
      const removed = await redis.zrem(JOB_QUEUE_KEY, item);
      if (!removed) continue; // Another instance already picked it up

      // Acquire lock
      const lockKey = `scheduler:lock:${jobId}`;
      const locked = await redis.set(lockKey, '1', 'PX', env.JOB_LOCK_TTL_MS, 'NX');
      if (!locked) continue;

      try {
        await executeJob(tenantId, jobId);
        await markJobExecuted(tenantId, jobId, true);
      } catch (err) {
        logger.error({ jobId, err }, 'Job execution failed');
        await markJobExecuted(tenantId, jobId, false);
      } finally {
        await redis.del(lockKey);
      }
    } catch (err) {
      logger.error({ item, err }, 'Failed to process queue item');
    }
  }
}

async function executeJob(tenantId: string, jobId: string) {
  const raw = await redis.get(`scheduler:job:${tenantId}:${jobId}`);
  if (!raw) return;

  const job = JSON.parse(raw);
  logger.info({ jobId, type: job.type, tenant: tenantId }, 'Executing job');

  switch (job.type) {
    case 'auto_close':
      logger.info({ jobId }, 'Auto-close job executed (would close inactive conversations)');
      break;

    case 'sla_check':
      logger.info({ jobId }, 'SLA check job executed (would check SLA breaches)');
      break;

    case 'reminder':
      logger.info({ jobId }, 'Reminder job executed');
      break;

    case 'report':
      logger.info({ jobId }, 'Report generation job executed');
      break;

    case 'custom':
      logger.info({ jobId, config: job.config }, 'Custom job executed');
      break;

    default:
      logger.warn({ jobId, type: job.type }, 'Unknown job type');
  }
}
