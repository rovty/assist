import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3007),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Storage
  STORAGE_PROVIDER: z.enum(['local', 'azure_blob']).default('local'),
  LOCAL_STORAGE_PATH: z.string().default('./uploads'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().default(''),
  AZURE_STORAGE_CONTAINER: z.string().default('assist-media'),

  // Limits
  MAX_FILE_SIZE_MB: z.coerce.number().default(100),
  MAX_FILES_PER_UPLOAD: z.coerce.number().default(10),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
