import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import {
  createPipelineSchema,
  updatePipelineSchema,
  pipelineParamsSchema,
} from '../schemas/lead.schema.js';
import {
  createPipeline,
  getPipeline,
  listPipelines,
  updatePipeline,
  deletePipeline,
} from '../services/pipeline.service.js';

export async function pipelineRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  /* ── Create Pipeline ─────────────────────────────────────── */
  app.post('/', {
    handler: async (request, reply) => {
      const { body } = createPipelineSchema.parse({ body: request.body });
      const { tenantId, userId } = request.tenantContext!;

      const pipeline = await createPipeline(tenantId, userId, body);
      return reply.status(201).send(pipeline);
    },
  });

  /* ── List Pipelines ──────────────────────────────────────── */
  app.get('/', {
    handler: async (request, reply) => {
      const { tenantId } = request.tenantContext!;
      const pipelines = await listPipelines(tenantId);
      return reply.send(pipelines);
    },
  });

  /* ── Get Pipeline ────────────────────────────────────────── */
  app.get('/:pipelineId', {
    handler: async (request, reply) => {
      const { params } = pipelineParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      const pipeline = await getPipeline(tenantId, params.pipelineId);
      if (!pipeline) return reply.status(404).send({ error: 'Pipeline not found' });
      return reply.send(pipeline);
    },
  });

  /* ── Update Pipeline ─────────────────────────────────────── */
  app.patch('/:pipelineId', {
    handler: async (request, reply) => {
      const { params, body } = updatePipelineSchema.parse({
        params: request.params,
        body: request.body,
      });
      const { tenantId } = request.tenantContext!;

      const updated = await updatePipeline(tenantId, params.pipelineId, body);
      if (!updated) return reply.status(404).send({ error: 'Pipeline not found' });
      return reply.send(updated);
    },
  });

  /* ── Delete Pipeline ─────────────────────────────────────── */
  app.delete('/:pipelineId', {
    handler: async (request, reply) => {
      const { params } = pipelineParamsSchema.parse({ params: request.params });
      const { tenantId } = request.tenantContext!;

      await deletePipeline(tenantId, params.pipelineId);
      return reply.status(204).send();
    },
  });
}
