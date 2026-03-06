import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { conversationService } from '../services/conversation.service.js';
import {
  createConversationSchema,
  sendMessageSchema,
  updateConversationSchema,
  listConversationsSchema,
} from '../schemas/conversation.schema.js';
import { extractTenantContext, requireRole } from '../middleware/auth.js';

export async function conversationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', extractTenantContext);

  // ─── List conversations ───
  app.get('/', async (request, reply) => {
    const query = listConversationsSchema.parse(request.query);
    const result = await conversationService.listConversations(request.tenantId!, query);
    return reply.send(success(result));
  });

  // ─── Create conversation (from widget or API) ───
  app.post('/', async (request, reply) => {
    const body = createConversationSchema.parse(request.body);
    const result = await conversationService.createConversation(
      request.tenantId!,
      request.userId!,
      body,
    );
    return reply.status(201).send(success(result));
  });

  // ─── Get single conversation ───
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const conversation = await conversationService.getConversation(
      request.tenantId!,
      request.params.id,
    );
    return reply.send(success(conversation));
  });

  // ─── Update conversation (status, assign, tags, priority) ───
  app.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requireRole('OWNER', 'ADMIN', 'AGENT')] },
    async (request, reply) => {
      const body = updateConversationSchema.parse(request.body);
      const conversation = await conversationService.updateConversation(
        request.tenantId!,
        request.params.id,
        body,
      );
      return reply.send(success(conversation));
    },
  );

  // ─── Assign conversation to agent ───
  app.post<{ Params: { id: string }; Body: { agentId: string } }>(
    '/:id/assign',
    { preHandler: [requireRole('OWNER', 'ADMIN', 'AGENT')] },
    async (request, reply) => {
      const conversation = await conversationService.assignConversation(
        request.tenantId!,
        request.params.id,
        request.body.agentId,
      );
      return reply.send(success(conversation));
    },
  );

  // ─── Get messages for a conversation ───
  app.get<{ Params: { id: string } }>('/:id/messages', async (request, reply) => {
    const { page = 1, pageSize = 50 } = request.query as { page?: number; pageSize?: number };
    const result = await conversationService.getMessages(
      request.tenantId!,
      request.params.id,
      Number(page),
      Number(pageSize),
    );
    return reply.send(success(result));
  });

  // ─── Send message ───
  app.post<{ Params: { id: string } }>('/:id/messages', async (request, reply) => {
    const body = sendMessageSchema.parse(request.body);
    const message = await conversationService.sendMessage(
      request.tenantId!,
      request.params.id,
      request.userId!,
      body,
    );
    return reply.status(201).send(success(message));
  });

  // ─── Mark messages as read ───
  app.post<{ Params: { id: string } }>('/:id/read', async (request, reply) => {
    const result = await conversationService.markMessagesRead(
      request.tenantId!,
      request.params.id,
      request.userId!,
    );
    return reply.send(success(result));
  });
}
