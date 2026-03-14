import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3013),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Scheduler
  TICK_INTERVAL_MS: z.coerce.number().default(30000),
  JOB_LOCK_TTL_MS: z.coerce.number().default(60000),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
