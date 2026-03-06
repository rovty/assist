import { z } from 'zod';

export const chatSchema = z.object({
  conversationId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    }),
  ),
  userMessage: z.string(),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export const summarizeSchema = z.object({
  conversationId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'agent', 'system']),
      content: z.string(),
      timestamp: z.string().optional(),
    }),
  ),
});

export const sentimentSchema = z.object({
  text: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
});

export const suggestReplySchema = z.object({
  conversationId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'agent']),
      content: z.string(),
    }),
  ),
  count: z.number().int().min(1).max(5).default(3),
});

export const classifySchema = z.object({
  text: z.string().min(1).max(5000),
  categories: z.array(z.string()).optional(),
  conversationId: z.string().optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type SummarizeInput = z.infer<typeof summarizeSchema>;
export type SentimentInput = z.infer<typeof sentimentSchema>;
export type SuggestReplyInput = z.infer<typeof suggestReplySchema>;
export type ClassifyInput = z.infer<typeof classifySchema>;
