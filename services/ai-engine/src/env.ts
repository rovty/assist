import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3004),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Azure OpenAI
  AZURE_OPENAI_ENDPOINT: z.string().default(''),
  AZURE_OPENAI_API_KEY: z.string().default(''),
  AZURE_OPENAI_DEPLOYMENT: z.string().default('gpt-4o'),
  AZURE_OPENAI_API_VERSION: z.string().default('2024-08-01-preview'),

  // Fallback OpenAI
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // AI Config
  AI_MAX_TOKENS: z.coerce.number().default(1024),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  AI_CONFIDENCE_THRESHOLD: z.coerce.number().min(0).max(1).default(0.7),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
