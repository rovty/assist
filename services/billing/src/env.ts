import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3015),
  MONGODB_URL: z.string(),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Stripe
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
