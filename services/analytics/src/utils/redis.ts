import Redis from 'ioredis';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('analytics:redis');

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error(err, 'Redis error'));

export async function connectRedis() {
  await redis.connect();
}
