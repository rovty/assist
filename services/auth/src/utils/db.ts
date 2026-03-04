import { PrismaClient } from '../generated/prisma/index.js';

import { createLogger } from '@assist/shared-utils';

const logger = createLogger('auth-db');

export const prisma = new PrismaClient({
  log:
    process.env['NODE_ENV'] === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
});

// Log slow queries in development
if (process.env['NODE_ENV'] === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 100) {
      logger.warn({ duration: e.duration, query: e.query }, 'Slow query detected');
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, disconnecting from database...');
  await prisma.$disconnect();
});
