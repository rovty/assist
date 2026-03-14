import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { extractTenantContext, requireRole } from '../middleware/auth.js';
import {
  createSourceSchema,
  searchKBSchema,
  listSourcesSchema,
  faqSchema,
} from '../schemas/kb.schema.js';
import {
  createSource,
  getSources,
  getSource,
  deleteSource,
  reprocessSource,
  searchKnowledgeBase,
  getKBStats,
} from '../services/kb.service.js';

export async function kbRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', extractTenantContext);

  // ─── Create Source ───
  app.post('/sources', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const body = createSourceSchema.parse(request.body);
    const source = await createSource(request.tenantContext.tenantId, body);
    reply.code(201).send(success(source));
  });

  // ─── Create FAQ Source (convenience endpoint) ───
  app.post('/sources/faq', { preHandler: requireRole('owner', 'admin') }, async (request, reply) => {
    const body = faqSchema.parse(request.body);
    const source = await createSource(request.tenantContext.tenantId, {
      type: 'faq',
      name: body.name,
      content: JSON.stringify(body.faqs),
    });
    reply.code(201).send(success(source));
  });

  // ─── List Sources ───
  app.get('/sources', async (request, reply) => {
    const query = listSourcesSchema.parse(request.query);
    const result = await getSources(request.tenantContext.tenantId, query);
    reply.send(success(result));
  });

  // ─── Get Source ───
  app.get<{ Params: { id: string } }>('/sources/:id', async (request, reply) => {
    const source = await getSource(request.tenantContext.tenantId, request.params.id);
    if (!source) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Source not found' });
      return;
    }
    reply.send(success(source));
  });

  // ─── Delete Source ───
  app.delete<{ Params: { id: string } }>(
    '/sources/:id',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const deleted = await deleteSource(request.tenantContext.tenantId, request.params.id);
      if (!deleted) {
        reply.code(404).send({ error: 'NOT_FOUND', message: 'Source not found' });
        return;
      }
      reply.code(204).send();
    },
  );

  // ─── Reprocess Source ───
  app.post<{ Params: { id: string } }>(
    '/sources/:id/reprocess',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const source = await reprocessSource(request.tenantContext.tenantId, request.params.id);
      if (!source) {
        reply.code(404).send({ error: 'NOT_FOUND', message: 'Source not found' });
        return;
      }
      reply.send(success(source));
    },
  );

  // ─── Search Knowledge Base ───
  app.post('/search', async (request, reply) => {
    const body = searchKBSchema.parse(request.body);
    const results = await searchKnowledgeBase(request.tenantContext.tenantId, body);
    reply.send(success(results));
  });

  // ─── Knowledge Base Stats ───
  app.get('/stats', async (request, reply) => {
    const stats = await getKBStats(request.tenantContext.tenantId);
    reply.send(success(stats));
  });
}
