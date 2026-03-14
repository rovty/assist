import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3009),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // ClickHouse
  CLICKHOUSE_URL: z.string().default('http://localhost:8123'),
  CLICKHOUSE_DATABASE: z.string().default('assist_analytics'),
  CLICKHOUSE_USER: z.string().default('default'),
  CLICKHOUSE_PASSWORD: z.string().default(''),

  // Aggregation
  AGGREGATION_INTERVAL_MS: z.coerce.number().default(60000),
  EVENT_BATCH_SIZE: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
