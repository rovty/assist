import Redis from 'ioredis';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('agent-workspace:redis');

let client: Redis;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
    client.on('error', (err) => logger.error(err, 'Redis error'));
    client.on('connect', () => logger.info('Redis connected'));
  }
  return client;
}

export async function connectRedis(): Promise<Redis> {
  const redis = getRedis();
  await redis.connect();
  return redis;
}
