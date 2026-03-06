import { z } from 'zod';

export const createConversationSchema = z.object({
  contactId: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactName: z.string().min(1).optional(),
  contactPhone: z.string().optional(),
  channel: z.enum(['web', 'whatsapp', 'messenger', 'instagram', 'telegram', 'sms', 'email', 'slack', 'line', 'viber']).default('web'),
  subject: z.string().max(200).optional(),
  initialMessage: z.string().min(1).max(5000),
  metadata: z.record(z.unknown()).optional(),
});

export const sendMessageSchema = z.object({
  content: z.object({
    type: z.enum(['text', 'image', 'video', 'audio', 'file', 'location', 'system']).default('text'),
    text: z.string().max(10000).optional(),
    mediaUrl: z.string().url().optional(),
    mimeType: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
  }),
  senderType: z.enum(['contact', 'agent', 'system']).default('contact'),
  replyToId: z.string().optional(),
});

export const updateConversationSchema = z.object({
  status: z.enum(['new', 'ai_active', 'queued', 'assigned', 'resolved', 'closed']).optional(),
  assignedAgentId: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
});

export const listConversationsSchema = z.object({
  status: z.enum(['new', 'ai_active', 'queued', 'assigned', 'resolved', 'closed']).optional(),
  assignedAgentId: z.string().optional(),
  channel: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'lastMessageAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  channel: z.enum(['web', 'whatsapp', 'messenger', 'instagram', 'telegram', 'sms', 'email', 'slack', 'line', 'viber']).default('web'),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ListConversationsInput = z.infer<typeof listConversationsSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
