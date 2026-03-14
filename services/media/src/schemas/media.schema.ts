import { z } from 'zod';

export const listMediaSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['image', 'video', 'audio', 'document', 'other']).optional(),
});

export type ListMediaInput = z.infer<typeof listMediaSchema>;
