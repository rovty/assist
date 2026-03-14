import mongoose from 'mongoose';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('billing:db');

export async function connectMongo(): Promise<typeof mongoose> {
  const conn = await mongoose.connect(env.MONGODB_URL, {
    minPoolSize: 2,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  logger.info('MongoDB connected');

  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected (SIGINT)');
  });

  return conn;
}
