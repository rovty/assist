import { z } from 'zod';

export const queryPeriodSchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  channel: z.string().optional(),
});

export const trackEventSchema = z.object({
  eventType: z.string().min(1),
  data: z.record(z.unknown()).default({}),
  sessionId: z.string().optional(),
  channel: z.string().optional(),
});

export const overviewQuerySchema = z.object({
  querystring: queryPeriodSchema,
});

export const conversationMetricsSchema = z.object({
  querystring: queryPeriodSchema,
});

export const agentMetricsSchema = z.object({
  querystring: queryPeriodSchema.extend({
    agentId: z.string().optional(),
  }),
});

export const aiMetricsSchema = z.object({
  querystring: queryPeriodSchema,
});

export const channelMetricsSchema = z.object({
  querystring: queryPeriodSchema,
});

export const trackEventBodySchema = z.object({
  body: trackEventSchema,
});

export const batchTrackSchema = z.object({
  body: z.object({
    events: z.array(trackEventSchema).min(1).max(500),
  }),
});

export type QueryPeriod = z.infer<typeof queryPeriodSchema>;
export type TrackEvent = z.infer<typeof trackEventSchema>;
