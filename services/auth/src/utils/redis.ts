import Redis from 'ioredis';

import { createLogger } from '@assist/shared-utils';

import { env } from '../env.js';

const logger = createLogger('auth-redis');

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Connected to Redis'));
redis.on('error', (err) => logger.error(err, 'Redis connection error'));

export async function connectRedis() {
  try {
    await redis.connect();
    logger.info('Redis connected successfully');
  } catch (err) {
    logger.error(err, 'Failed to connect to Redis');
    throw err;
  }
}
