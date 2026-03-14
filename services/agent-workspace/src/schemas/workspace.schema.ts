import { z } from 'zod';

/* ─── Agent Status ─────────────────────────────────────────── */

export const agentStatusEnum = z.enum(['online', 'away', 'busy', 'offline']);

export const updateAgentStatusSchema = z.object({
  body: z.object({
    status: agentStatusEnum,
    maxConcurrent: z.number().int().min(1).max(50).optional(),
    skills: z.array(z.string()).optional(),
  }),
});

/* ─── Queue ────────────────────────────────────────────────── */

export const enqueueSchema = z.object({
  body: z.object({
    conversationId: z.string().min(1),
    channel: z.string().min(1),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    skills: z.array(z.string()).default([]),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const dequeueSchema = z.object({
  body: z.object({
    agentId: z.string().min(1).optional(),
  }).optional(),
});

export const queueItemParamsSchema = z.object({
  params: z.object({
    itemId: z.string().min(1),
  }),
});

/* ─── Routing ──────────────────────────────────────────────── */

export const routingStrategyEnum = z.enum(['round-robin', 'least-busy', 'skill-based', 'manual']);

export const updateRoutingConfigSchema = z.object({
  body: z.object({
    strategy: routingStrategyEnum,
    autoAssign: z.boolean().default(true),
    maxQueueWaitMs: z.number().int().min(0).optional(),
  }),
});

/* ─── Canned Responses ─────────────────────────────────────── */

export const createCannedResponseSchema = z.object({
  body: z.object({
    shortcut: z.string().min(1).max(50).regex(/^\/[a-z0-9_-]+$/),
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    category: z.string().max(100).optional(),
    isGlobal: z.boolean().default(false),
  }),
});

export const updateCannedResponseSchema = z.object({
  params: z.object({
    responseId: z.string().min(1),
  }),
  body: z.object({
    shortcut: z.string().min(1).max(50).regex(/^\/[a-z0-9_-]+$/).optional(),
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(5000).optional(),
    category: z.string().max(100).optional(),
    isGlobal: z.boolean().optional(),
  }),
});

export const cannedResponseParamsSchema = z.object({
  params: z.object({
    responseId: z.string().min(1),
  }),
});

export const searchCannedResponsesSchema = z.object({
  querystring: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
  }),
});

/* ─── Inferred types ───────────────────────────────────────── */

export type UpdateAgentStatusInput = z.infer<typeof updateAgentStatusSchema>['body'];
export type EnqueueInput = z.infer<typeof enqueueSchema>['body'];
export type CreateCannedInput = z.infer<typeof createCannedResponseSchema>['body'];
export type UpdateCannedInput = z.infer<typeof updateCannedResponseSchema>['body'];
export type UpdateRoutingInput = z.infer<typeof updateRoutingConfigSchema>['body'];
