import mongoose from 'mongoose';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('kb-db');

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URL);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.fatal(err, 'Failed to connect to MongoDB');
    throw err;
  }
}
