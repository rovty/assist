import { z } from 'zod';

import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
