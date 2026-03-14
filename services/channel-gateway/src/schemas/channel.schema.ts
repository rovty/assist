import { z } from 'zod';

export const connectChannelSchema = z.object({
  provider: z.enum(['whatsapp', 'messenger', 'telegram', 'instagram', 'sms', 'email', 'slack']),
  name: z.string().min(1).max(100),
  credentials: z.record(z.string()).optional(),
  config: z
    .object({
      welcomeMessage: z.string().optional(),
      autoReply: z.boolean().optional(),
      aiEnabled: z.boolean().default(true),
      businessHoursOnly: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z
    .object({
      welcomeMessage: z.string().optional(),
      autoReply: z.boolean().optional(),
      aiEnabled: z.boolean().optional(),
      businessHoursOnly: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const sendOutboundSchema = z.object({
  connectionId: z.string().min(1),
  externalContactId: z.string().min(1),
  messageType: z.enum(['text', 'image', 'video', 'audio', 'file', 'template']),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  templateId: z.string().optional(),
  templateParams: z.record(z.string()).optional(),
});

export type ConnectChannelInput = z.infer<typeof connectChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
export type SendOutboundInput = z.infer<typeof sendOutboundSchema>;
