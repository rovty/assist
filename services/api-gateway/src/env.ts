import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32).default('legacy-jwt-secret-no-longer-used-000'),
  REDIS_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  TENANT_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  CONVERSATION_SERVICE_URL: z.string().url().default('http://localhost:3003'),
  AI_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  KNOWLEDGE_BASE_SERVICE_URL: z.string().url().default('http://localhost:3006'),
  MEDIA_SERVICE_URL: z.string().url().default('http://localhost:3007'),
  CHANNEL_GATEWAY_SERVICE_URL: z.string().url().default('http://localhost:3008'),
  ANALYTICS_SERVICE_URL: z.string().url().default('http://localhost:3009'),
  WEBHOOK_SERVICE_URL: z.string().url().default('http://localhost:3010'),
  BOT_BUILDER_SERVICE_URL: z.string().url().default('http://localhost:3011'),
  LEAD_CRM_SERVICE_URL: z.string().url().default('http://localhost:3012'),
  SCHEDULER_SERVICE_URL: z.string().url().default('http://localhost:3013'),
  AGENT_WORKSPACE_SERVICE_URL: z.string().url().default('http://localhost:3014'),
  BILLING_SERVICE_URL: z.string().url().default('http://localhost:3015'),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
