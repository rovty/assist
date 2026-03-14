import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    type: z.enum(['auto_close', 'reminder', 'report', 'sla_check', 'custom']),
    name: z.string().min(1).max(200),
    cronExpression: z.string(),
    config: z.record(z.unknown()).default({}),
    enabled: z.boolean().default(true),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({ jobId: z.string() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    cronExpression: z.string().optional(),
    config: z.record(z.unknown()).optional(),
    enabled: z.boolean().optional(),
  }),
});

export const jobParamsSchema = z.object({
  params: z.object({ jobId: z.string() }),
});

export const listJobsSchema = z.object({
  querystring: z.object({
    type: z.enum(['auto_close', 'reminder', 'report', 'sla_check', 'custom']).optional(),
    status: z.enum(['active', 'paused', 'completed', 'failed']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const businessHoursSchema = z.object({
  body: z.object({
    timezone: z.string().default('UTC'),
    schedule: z.record(z.object({
      enabled: z.boolean(),
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    })),
  }),
});

export const createSLASchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    targets: z.object({
      low: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      medium: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      high: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      urgent: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
    }),
    enabled: z.boolean().default(true),
  }),
});

export const updateSLASchema = z.object({
  params: z.object({ slaId: z.string() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    targets: z.object({
      low: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      medium: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      high: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
      urgent: z.object({ firstResponseMinutes: z.number(), resolutionMinutes: z.number() }).optional(),
    }).optional(),
    enabled: z.boolean().optional(),
  }),
});

export const slaParamsSchema = z.object({
  params: z.object({ slaId: z.string() }),
});

export type CreateJob = z.infer<typeof createJobSchema>['body'];
export type UpdateJob = z.infer<typeof updateJobSchema>['body'];
export type BusinessHoursConfig = z.infer<typeof businessHoursSchema>['body'];
export type CreateSLA = z.infer<typeof createSLASchema>['body'];
export type UpdateSLA = z.infer<typeof updateSLASchema>['body'];
