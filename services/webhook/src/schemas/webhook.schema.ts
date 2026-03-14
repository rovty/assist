import { z } from 'zod';

export const createEndpointSchema = z.object({
  body: z.object({
    url: z.string().url(),
    events: z.array(z.string()).min(1),
    description: z.string().max(500).optional(),
    secret: z.string().min(16).optional(),
    retryPolicy: z.object({
      maxRetries: z.number().min(0).max(10).default(5),
      backoffMs: z.number().min(1000).max(60000).default(5000),
    }).optional(),
    headers: z.record(z.string()).optional(),
    enabled: z.boolean().default(true),
  }),
});

export const updateEndpointSchema = z.object({
  params: z.object({ endpointId: z.string() }),
  body: z.object({
    url: z.string().url().optional(),
    events: z.array(z.string()).min(1).optional(),
    description: z.string().max(500).optional(),
    secret: z.string().min(16).optional(),
    retryPolicy: z.object({
      maxRetries: z.number().min(0).max(10).optional(),
      backoffMs: z.number().min(1000).max(60000).optional(),
    }).optional(),
    headers: z.record(z.string()).optional(),
    enabled: z.boolean().optional(),
  }),
});

export const endpointParamsSchema = z.object({
  params: z.object({ endpointId: z.string() }),
});

export const listEndpointsSchema = z.object({
  querystring: z.object({
    event: z.string().optional(),
    enabled: z.string().optional().transform((v) => v === 'true' ? true : v === 'false' ? false : undefined),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const listDeliveriesSchema = z.object({
  params: z.object({ endpointId: z.string() }),
  querystring: z.object({
    status: z.enum(['pending', 'success', 'failed']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
});

export const retryDeliverySchema = z.object({
  params: z.object({
    endpointId: z.string(),
    deliveryId: z.string(),
  }),
});

export type CreateEndpoint = z.infer<typeof createEndpointSchema>['body'];
export type UpdateEndpoint = z.infer<typeof updateEndpointSchema>['body'];
