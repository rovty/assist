import { z } from 'zod';
import { baseEnvSchema, loadEnv } from '@assist/shared-utils';

const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().default(3008),
  REDIS_URL: z.string(),
  KAFKA_BROKERS: z.string().default('localhost:9094'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Conversation service URL (to forward messages)
  CONVERSATION_SERVICE_URL: z.string().url().default('http://localhost:3003'),

  // WhatsApp Business Cloud API
  WHATSAPP_ACCESS_TOKEN: z.string().default(''),
  WHATSAPP_VERIFY_TOKEN: z.string().default('assist_whatsapp_verify'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default(''),
  META_APP_SECRET: z.string().default(''),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().default(''),

  // Messenger (Meta)
  MESSENGER_PAGE_ACCESS_TOKEN: z.string().default(''),
  MESSENGER_VERIFY_TOKEN: z.string().default('assist_messenger_verify'),
});

export type Env = z.infer<typeof envSchema>;
export const env = loadEnv(envSchema);
