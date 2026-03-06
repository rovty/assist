import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { conversationService } from '../services/conversation.service.js';
import { createContactSchema } from '../schemas/conversation.schema.js';
import { extractTenantContext } from '../middleware/auth.js';

export async function contactRoutes(app: FastifyInstance) {
  app.addHook('preHandler', extractTenantContext);

  // ─── List contacts ───
  app.get('/', async (request, reply) => {
    const { page = 1, pageSize = 20 } = request.query as { page?: number; pageSize?: number };
    const result = await conversationService.listContacts(
      request.tenantId!,
      Number(page),
      Number(pageSize),
    );
    return reply.send(success(result));
  });

  // ─── Create contact ───
  app.post('/', async (request, reply) => {
    const body = createContactSchema.parse(request.body);
    const contact = await conversationService.createContact(request.tenantId!, body);
    return reply.status(201).send(success(contact));
  });

  // ─── Get contact ───
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const contact = await conversationService.getContact(request.tenantId!, request.params.id);
    return reply.send(success(contact));
  });

  // ─── Get contact conversations ───
  app.get<{ Params: { id: string } }>('/:id/conversations', async (request, reply) => {
    const conversations = await conversationService.getContactConversations(
      request.tenantId!,
      request.params.id,
    );
    return reply.send(success(conversations));
  });
}
