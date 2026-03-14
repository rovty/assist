import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3006),
  REDIS_URL: z.string(),
  MONGODB_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Azure OpenAI (for embeddings)
  AZURE_OPENAI_ENDPOINT: z.string().default(''),
  AZURE_OPENAI_API_KEY: z.string().default(''),
  AZURE_OPENAI_EMBEDDING_DEPLOYMENT: z.string().default('text-embedding-3-large'),
  AZURE_OPENAI_API_VERSION: z.string().default('2024-08-01-preview'),

  // Fallback OpenAI
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // KB Config
  KB_CHUNK_SIZE: z.coerce.number().default(500),
  KB_CHUNK_OVERLAP: z.coerce.number().default(50),
  KB_MAX_SOURCES_PER_TENANT: z.coerce.number().default(100),
  KB_SEARCH_TOP_K: z.coerce.number().default(5),
  KB_SEARCH_MIN_SCORE: z.coerce.number().default(0.7),

  // Media service URL (for file downloads)
  MEDIA_SERVICE_URL: z.string().url().default('http://localhost:3007'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
