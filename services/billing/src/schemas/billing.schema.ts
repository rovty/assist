import { z } from 'zod';

/* ─── Plans ────────────────────────────────────────────────── */

export const planIdEnum = z.enum(['free', 'starter', 'professional', 'enterprise']);

/* ─── Subscription ─────────────────────────────────────────── */

export const createCheckoutSchema = z.object({
  body: z.object({
    planId: planIdEnum,
    seats: z.number().int().min(1).default(1),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    planId: planIdEnum.optional(),
    seats: z.number().int().min(1).optional(),
  }),
});

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    cancelAtPeriodEnd: z.boolean().default(true),
  }),
});

/* ─── Invoices ─────────────────────────────────────────────── */

export const listInvoicesSchema = z.object({
  querystring: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

/* ─── Usage ────────────────────────────────────────────────── */

export const recordUsageSchema = z.object({
  body: z.object({
    metric: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
  }),
});

export const getUsageSchema = z.object({
  querystring: z.object({
    metric: z.string().optional(),
    period: z.string().optional(), // YYYY-MM format
  }),
});

/* ─── Types ────────────────────────────────────────────────── */

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>['body'];
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>['body'];
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>['body'];
export type RecordUsageInput = z.infer<typeof recordUsageSchema>['body'];
