import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { extractTenantContext, requireRole } from '../middleware/auth.js';
import {
  connectChannelSchema,
  updateChannelSchema,
  sendOutboundSchema,
} from '../schemas/channel.schema.js';
import {
  connectChannel,
  getConnections,
  getConnection,
  updateConnection,
  disconnectChannel,
  deleteConnection,
  sendOutboundMessage,
} from '../services/channel.service.js';

export async function channelRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', extractTenantContext);

  // ─── Connect Channel ───
  app.post(
    '/connections',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const body = connectChannelSchema.parse(request.body);
      const connection = await connectChannel(request.tenantContext.tenantId, body);
      reply.code(201).send(success(connection));
    },
  );

  // ─── List Connections ───
  app.get('/connections', async (request, reply) => {
    const connections = await getConnections(request.tenantContext.tenantId);
    reply.send(success({ data: connections, count: connections.length }));
  });

  // ─── Get Connection ───
  app.get<{ Params: { id: string } }>('/connections/:id', async (request, reply) => {
    const connection = await getConnection(request.tenantContext.tenantId, request.params.id);
    if (!connection) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'Channel connection not found' });
      return;
    }
    reply.send(success(connection));
  });

  // ─── Update Connection ───
  app.patch<{ Params: { id: string } }>(
    '/connections/:id',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const body = updateChannelSchema.parse(request.body);
      const connection = await updateConnection(
        request.tenantContext.tenantId,
        request.params.id,
        body,
      );
      if (!connection) {
        reply.code(404).send({ error: 'NOT_FOUND', message: 'Channel connection not found' });
        return;
      }
      reply.send(success(connection));
    },
  );

  // ─── Disconnect Channel ───
  app.post<{ Params: { id: string } }>(
    '/connections/:id/disconnect',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const disconnected = await disconnectChannel(
        request.tenantContext.tenantId,
        request.params.id,
      );
      if (!disconnected) {
        reply.code(404).send({ error: 'NOT_FOUND', message: 'Channel connection not found' });
        return;
      }
      reply.send(success({ message: 'Channel disconnected' }));
    },
  );

  // ─── Delete Connection ───
  app.delete<{ Params: { id: string } }>(
    '/connections/:id',
    { preHandler: requireRole('owner', 'admin') },
    async (request, reply) => {
      const deleted = await deleteConnection(request.tenantContext.tenantId, request.params.id);
      if (!deleted) {
        reply.code(404).send({ error: 'NOT_FOUND', message: 'Channel connection not found' });
        return;
      }
      reply.code(204).send();
    },
  );

  // ─── Send Outbound Message ───
  app.post('/send', async (request, reply) => {
    const body = sendOutboundSchema.parse(request.body);
    const result = await sendOutboundMessage(request.tenantContext.tenantId, body);

    if (!result.success) {
      reply.code(400).send({ error: 'SEND_FAILED', message: result.error });
      return;
    }

    reply.send(success(result));
  });
}
