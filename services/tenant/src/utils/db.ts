import { PrismaClient } from '../generated/prisma/index.js';

export const prisma = new PrismaClient({
  log:
    process.env['NODE_ENV'] === 'development'
      ? [{ level: 'error', emit: 'stdout' }, { level: 'warn', emit: 'stdout' }]
      : [{ level: 'error', emit: 'stdout' }],
});

process.on('SIGTERM', async () => { await prisma.$disconnect(); });
process.on('SIGINT', async () => { await prisma.$disconnect(); });
