import { z } from 'zod';

export const createSourceSchema = z.object({
  type: z.enum(['url', 'file', 'text', 'sitemap', 'faq']),
  name: z.string().min(1).max(200),
  url: z.string().url().optional(),
  fileId: z.string().optional(),
  content: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    if (data.type === 'url' || data.type === 'sitemap') return !!data.url;
    if (data.type === 'file') return !!data.fileId;
    if (data.type === 'text' || data.type === 'faq') return !!data.content;
    return true;
  },
  { message: 'Source type requires corresponding field (url, fileId, or content)' },
);

export const searchKBSchema = z.object({
  query: z.string().min(1).max(1000),
  topK: z.coerce.number().int().min(1).max(20).default(5),
  minScore: z.coerce.number().min(0).max(1).default(0.7),
  sourceIds: z.array(z.string()).optional(),
});

export const listSourcesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['url', 'file', 'text', 'sitemap', 'faq']).optional(),
  status: z.enum(['pending', 'processing', 'ready', 'failed', 'stale']).optional(),
});

export const faqSchema = z.object({
  name: z.string().min(1).max(200),
  faqs: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  ).min(1).max(500),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type SearchKBInput = z.infer<typeof searchKBSchema>;
export type ListSourcesInput = z.infer<typeof listSourcesSchema>;
export type FAQInput = z.infer<typeof faqSchema>;
