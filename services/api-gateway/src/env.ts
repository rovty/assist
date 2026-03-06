import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  TENANT_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  CONVERSATION_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  AI_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
