import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3010),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Delivery
  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(10000),
  WEBHOOK_MAX_RETRIES: z.coerce.number().default(5),
  WEBHOOK_RETRY_BACKOFF_MS: z.coerce.number().default(5000),
  WEBHOOK_SIGNING_SECRET: z.string().default('whsec_dev_secret_key'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
