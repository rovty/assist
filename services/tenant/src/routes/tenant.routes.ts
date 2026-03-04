import type { FastifyInstance } from 'fastify';

import { success } from '@assist/shared-utils';

import { tenantService } from '../services/tenant.service.js';
import { updateTenantSchema, updateSettingsSchema, inviteMemberSchema } from '../schemas/tenant.schema.js';
import { extractTenantContext, requireRole } from '../middleware/auth.js';

export async function tenantRoutes(app: FastifyInstance) {
  // All tenant routes require tenant context
  app.addHook('preHandler', extractTenantContext);

  // ─── GET /tenants/current ───
  app.get('/current', async (request, reply) => {
    const tenant = await tenantService.getTenant(request.tenantId!);
    return reply.send(success(tenant));
  });

  // ─── PUT /tenants/current ───
  app.put('/current', { preHandler: [requireRole('OWNER', 'ADMIN')] }, async (request, reply) => {
    const body = updateTenantSchema.parse(request.body);
    const tenant = await tenantService.updateTenant(request.tenantId!, body);
    return reply.send(success(tenant));
  });

  // ─── GET /tenants/current/settings ───
  app.get('/current/settings', async (request, reply) => {
    const settings = await tenantService.getSettings(request.tenantId!);
    return reply.send(success(settings));
  });

  // ─── PUT /tenants/current/settings ───
  app.put('/current/settings', { preHandler: [requireRole('OWNER', 'ADMIN')] }, async (request, reply) => {
    const body = updateSettingsSchema.parse(request.body);
    const settings = await tenantService.updateSettings(request.tenantId!, body);
    return reply.send(success(settings));
  });

  // ─── GET /tenants/current/usage ───
  app.get('/current/usage', async (request, reply) => {
    const usage = await tenantService.getUsage(request.tenantId!);
    return reply.send(success(usage));
  });

  // ─── GET /tenants/current/members ───
  app.get('/current/members', async (request, reply) => {
    const members = await tenantService.listMembers(request.tenantId!);
    return reply.send(success(members));
  });

  // ─── POST /tenants/current/members/invite ───
  app.post('/current/members/invite', { preHandler: [requireRole('OWNER', 'ADMIN')] }, async (request, reply) => {
    const body = inviteMemberSchema.parse(request.body);
    const invitation = await tenantService.inviteMember(request.tenantId!, request.userId!, body);
    return reply.status(201).send(success(invitation));
  });

  // ─── DELETE /tenants/current/members/:id ───
  app.delete<{ Params: { id: string } }>(
    '/current/members/:id',
    { preHandler: [requireRole('OWNER', 'ADMIN')] },
    async (request, reply) => {
      await tenantService.removeMember(request.tenantId!, request.params.id);
      return reply.send(success({ message: 'Member removed' }));
    },
  );

  // ─── POST /tenants/invitations/:token/accept ───
  app.post<{ Params: { token: string } }>('/invitations/:token/accept', async (request, reply) => {
    const result = await tenantService.acceptInvitation(request.params.token, request.userId!);
    return reply.send(success(result));
  });

  // ─── GET /tenants/plans ───
  // Public endpoint — no auth required
  app.get('/plans', async (_request, reply) => {
    const plans = await tenantService.getPlans();
    return reply.send(success(plans));
  });
}
