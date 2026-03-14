import mongoose from 'mongoose';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('bot-builder:db');

export async function connectMongo() {
  try {
    await mongoose.connect(env.MONGODB_URL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.fatal(err, 'Failed to connect to MongoDB');
    throw err;
  }
}

mongoose.connection.on('error', (err) => {
  logger.error(err, 'MongoDB connection error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
});
