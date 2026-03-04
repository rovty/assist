import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const updateSettingsSchema = z.object({
  // Branding
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  widgetPosition: z.enum(['bottom-right', 'bottom-left']).optional(),
  welcomeMessage: z.string().max(500).optional(),
  offlineMessage: z.string().max(500).optional(),

  // AI
  aiEnabled: z.boolean().optional(),
  aiTone: z.enum(['formal', 'friendly', 'professional']).optional(),
  aiConfidenceThreshold: z.number().min(0).max(1).optional(),
  aiMaxTokens: z.number().int().min(64).max(4096).optional(),
  aiSystemPrompt: z.string().max(2000).nullable().optional(),

  // Widget
  widgetEnabled: z.boolean().optional(),
  allowedDomains: z.array(z.string()).optional(),
  preChatForm: z.boolean().optional(),
  offlineFormEnabled: z.boolean().optional(),

  // Notifications
  emailOnNewConversation: z.boolean().optional(),
  emailOnEscalation: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'AGENT', 'VIEWER']).default('AGENT'),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
