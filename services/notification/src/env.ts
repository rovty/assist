import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3005),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // SMTP
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_SECURE: z.string().default('false').transform((v) => v === 'true'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  SMTP_FROM: z.string().default('noreply@assist.dev'),

  // Webhook
  WEBHOOK_TIMEOUT_MS: z.coerce.number().default(10000),
  WEBHOOK_MAX_RETRIES: z.coerce.number().default(3),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
