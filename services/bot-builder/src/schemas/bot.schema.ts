import { z } from 'zod';

const nodeSchema = z.object({
  nodeId: z.string(),
  type: z.enum(['trigger', 'message', 'condition', 'action', 'ai_response', 'handoff', 'delay', 'collect_input', 'api_call', 'set_variable']),
  label: z.string().max(200),
  position: z.object({ x: z.number(), y: z.number() }).default({ x: 0, y: 0 }),
  data: z.record(z.unknown()).default({}),
});

const edgeSchema = z.object({
  edgeId: z.string(),
  source: z.string(),
  target: z.string(),
  condition: z.string().optional(),
  label: z.string().optional(),
});

export const createBotSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    trigger: z.string().default('on_message'),
  }),
});

export const updateBotSchema = z.object({
  params: z.object({ botId: z.string() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    trigger: z.string().optional(),
  }),
});

export const saveFlowSchema = z.object({
  params: z.object({ botId: z.string() }),
  body: z.object({
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),
    variables: z.record(z.string()).optional(),
  }),
});

export const botParamsSchema = z.object({
  params: z.object({ botId: z.string() }),
});

export const listBotsSchema = z.object({
  querystring: z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const simulateSchema = z.object({
  params: z.object({ botId: z.string() }),
  body: z.object({
    input: z.string(),
    variables: z.record(z.string()).optional(),
  }),
});

export type CreateBot = z.infer<typeof createBotSchema>['body'];
export type UpdateBot = z.infer<typeof updateBotSchema>['body'];
export type SaveFlow = z.infer<typeof saveFlowSchema>['body'];
