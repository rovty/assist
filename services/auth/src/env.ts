import { z } from 'zod';

import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32).default('legacy-jwt-secret-no-longer-used-000'),
  JWT_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url().default('https://your-project.supabase.co'),
  SUPABASE_JWKS_URL: z.string().url().default('https://your-project.supabase.co/auth/v1/.well-known/jwks.json'),
  SUPABASE_JWT_ISSUER: z.string().url().default('https://your-project.supabase.co/auth/v1'),
  SUPABASE_JWT_AUDIENCE: z.string().default('authenticated'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
