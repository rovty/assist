import crypto from 'node:crypto';

import { createLogger, NotFoundError, ConflictError, BadRequestError } from '@assist/shared-utils';

import { prisma } from '../utils/db.js';
import type { UpdateTenantInput, UpdateSettingsInput, InviteMemberInput } from '../schemas/tenant.schema.js';

const logger = createLogger('tenant-service');

export class TenantService {
  /**
   * Get tenant details by ID
   */
  async getTenant(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        settings: true,
        plans: true,
        subscription: true,
      },
    });

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    return tenant;
  }

  /**
   * Update tenant name
   */
  async updateTenant(tenantId: string, input: UpdateTenantInput) {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: input,
    });

    logger.info({ tenantId }, 'Tenant updated');
    return tenant;
  }

  /**
   * Get or create tenant settings
   */
  async getSettings(tenantId: string) {
    let settings = await prisma.tenantSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: { tenantId },
      });
    }

    return settings;
  }

  /**
   * Update tenant settings (branding, AI config, widget, notifications)
   */
  async updateSettings(tenantId: string, input: UpdateSettingsInput) {
    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      update: input,
      create: { tenantId, ...input },
    });

    logger.info({ tenantId }, 'Tenant settings updated');
    return settings;
  }

  /**
   * Get tenant usage (current period)
   */
  async getUsage(tenantId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenantId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plans: true },
    });

    const plan = tenant?.plans;
    const usage: Record<string, { used: number; limit: number }> = {
      ai_messages: {
        used: usageRecords.find((r) => r.metric === 'ai_messages')?.count ?? 0,
        limit: plan?.aiMessagesPerMonth ?? 1000,
      },
      contacts: {
        used: usageRecords.find((r) => r.metric === 'contacts')?.count ?? 0,
        limit: plan?.contacts ?? 500,
      },
      storage_mb: {
        used: usageRecords.find((r) => r.metric === 'storage_mb')?.count ?? 0,
        limit: plan?.storageMb ?? 100,
      },
    };

    return {
      tenantId,
      period: { start: periodStart, end: periodEnd },
      usage,
    };
  }

  /**
   * List members of a tenant
   */
  async listMembers(tenantId: string) {
    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      orderBy: { joinedAt: 'desc' },
    });

    return members;
  }

  /**
   * Invite a new member to the tenant
   */
  async inviteMember(tenantId: string, invitedBy: string, input: InviteMemberInput) {
    // Check if already a member
    const existingMember = await prisma.tenantMember.findFirst({
      where: { tenantId, userId: input.email }, // We'll match by email after user lookup
    });

    if (existingMember) {
      throw new ConflictError('This user is already a member of this workspace');
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: { tenantId, email: input.email, status: 'PENDING' },
    });

    if (existingInvite) {
      throw new ConflictError('An invitation for this email is already pending');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        tenantId,
        email: input.email,
        role: input.role,
        token,
        invitedBy,
        expiresAt,
      },
    });

    logger.info({ tenantId, email: input.email }, 'Member invited');

    // TODO: Send invitation email via Notification Service

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      throw new BadRequestError('Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestError('Invitation has expired');
    }

    await prisma.$transaction([
      prisma.tenantMember.create({
        data: {
          tenantId: invitation.tenantId,
          userId,
          role: invitation.role,
          invitedBy: invitation.invitedBy,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      }),
    ]);

    logger.info({ tenantId: invitation.tenantId, userId }, 'Invitation accepted');

    return { tenantId: invitation.tenantId, role: invitation.role };
  }

  /**
   * Remove a member from the tenant
   */
  async removeMember(tenantId: string, memberId: string) {
    const member = await prisma.tenantMember.findFirst({
      where: { id: memberId, tenantId },
    });

    if (!member) {
      throw new NotFoundError('Member', memberId);
    }

    await prisma.tenantMember.delete({ where: { id: memberId } });

    logger.info({ tenantId, memberId }, 'Member removed');
  }

  /**
   * Get all available plans
   */
  async getPlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }
}

export const tenantService = new TenantService();
