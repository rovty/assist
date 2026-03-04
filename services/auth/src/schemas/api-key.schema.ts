import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum([
    'conversations:read',
    'conversations:write',
    'contacts:read',
    'contacts:write',
    'knowledge-base:read',
    'knowledge-base:write',
    'analytics:read',
    'webhooks:manage',
  ])).min(1),
  expiresInDays: z.number().int().positive().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
