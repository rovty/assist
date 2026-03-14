import { z } from 'zod';

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    company: z.string().max(200).optional(),
    title: z.string().max(200).optional(),
    source: z.string().default('web'),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.unknown()).optional(),
    pipelineId: z.string().optional(),
    stageId: z.string().optional(),
    conversationId: z.string().optional(),
    contactId: z.string().optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({ leadId: z.string() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    company: z.string().max(200).optional(),
    title: z.string().max(200).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.unknown()).optional(),
    assignedTo: z.string().optional(),
  }),
});

export const leadParamsSchema = z.object({
  params: z.object({ leadId: z.string() }),
});

export const listLeadsSchema = z.object({
  querystring: z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
    source: z.string().optional(),
    pipelineId: z.string().optional(),
    stageId: z.string().optional(),
    assignedTo: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'score', 'name', 'lastActivityAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const moveLeadSchema = z.object({
  params: z.object({ leadId: z.string() }),
  body: z.object({
    pipelineId: z.string(),
    stageId: z.string(),
  }),
});

export const logActivitySchema = z.object({
  params: z.object({ leadId: z.string() }),
  body: z.object({
    type: z.enum(['note', 'email', 'call', 'meeting', 'task']),
    title: z.string().min(1).max(300),
    description: z.string().max(5000).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const listActivitiesSchema = z.object({
  params: z.object({ leadId: z.string() }),
  querystring: z.object({
    type: z.enum(['note', 'email', 'call', 'meeting', 'task', 'stage_change', 'score_change']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const createPipelineSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    stages: z.array(z.object({
      name: z.string().min(1).max(100),
      color: z.string().optional(),
    })).min(1),
    isDefault: z.boolean().optional(),
  }),
});

export const updatePipelineSchema = z.object({
  params: z.object({ pipelineId: z.string() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    stages: z.array(z.object({
      stageId: z.string().optional(),
      name: z.string().min(1).max(100),
      color: z.string().optional(),
    })).min(1).optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const pipelineParamsSchema = z.object({
  params: z.object({ pipelineId: z.string() }),
});

export type CreateLead = z.infer<typeof createLeadSchema>['body'];
export type UpdateLead = z.infer<typeof updateLeadSchema>['body'];
export type CreatePipeline = z.infer<typeof createPipelineSchema>['body'];
export type UpdatePipeline = z.infer<typeof updatePipelineSchema>['body'];
