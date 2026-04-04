import type { JWTPayload } from 'jose';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { createLogger, NotFoundError, UnauthorizedError } from '@assist/shared-utils';
import type { JwtPayload, UserRole, UserStatus } from '@assist/shared-types';

import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';

const logger = createLogger('auth-service');

const ALL_PERMISSIONS = [
  'dashboard:read',
  'conversations:read',
  'conversations:write',
  'contacts:read',
  'contacts:write',
  'bots:read',
  'bots:write',
  'knowledge-base:read',
  'knowledge-base:write',
  'analytics:read',
  'webhooks:manage',
  'channels:manage',
  'billing:read',
  'billing:manage',
  'settings:read',
  'settings:write',
  'team:manage',
] as const;

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [...ALL_PERMISSIONS],
  ADMIN: ALL_PERMISSIONS.filter((permission) => permission !== 'billing:manage'),
  AGENT: ['dashboard:read', 'conversations:read', 'conversations:write', 'contacts:read', 'knowledge-base:read'],
  VIEWER: ['dashboard:read', 'conversations:read', 'contacts:read', 'analytics:read', 'knowledge-base:read'],
};

interface SupabaseAppMetadata {
  provider?: string;
  providers?: string[];
}

interface SupabaseUserMetadata {
  name?: string;
  full_name?: string;
  workspaceName?: string;
  tenantName?: string;
  organizationName?: string;
  avatar_url?: string;
  picture?: string;
}

interface SupabaseClaims extends JWTPayload {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  email_confirmed_at?: string;
  app_metadata?: SupabaseAppMetadata;
  user_metadata?: SupabaseUserMetadata;
}

const jwks = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL));

export class AuthService {
  async resolveAuthContext(token: string): Promise<JwtPayload> {
    const blacklisted = await redis.get(`bl:${token}`);
    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const claims = await this.verifySupabaseToken(token);
    const user = await this.resolveOrProvisionUser(claims);

    return {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as UserRole,
      supabaseUserId: claims.sub,
      provider: this.mapProviderLabel(claims.app_metadata?.provider),
      permissions: this.getPermissions(user.role),
      iat: typeof claims.iat === 'number' ? claims.iat : Math.floor(Date.now() / 1000),
      exp: typeof claims.exp === 'number' ? claims.exp : Math.floor(Date.now() / 1000) + 3600,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.resolveAuthContext(token);
  }

  async logout(userId: string, accessToken?: string) {
    if (accessToken) {
      const claims = await this.verifySupabaseToken(accessToken);
      if (typeof claims.exp === 'number') {
        const ttl = claims.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redis.setex(`bl:${accessToken}`, ttl, '1');
        }
      }
    }

    logger.info({ userId }, 'User logged out');
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, authIdentities: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      user: this.sanitizeUser(user),
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
      authorization: {
        tenantId: user.tenantId,
        role: user.role,
        permissions: this.getPermissions(user.role),
      },
      identities: user.authIdentities.map((identity) => ({
        id: identity.id,
        provider: identity.provider,
        email: identity.email,
        supabaseUserId: identity.supabaseUserId,
        lastUsedAt: identity.lastUsedAt,
      })),
    };
  }

  private async verifySupabaseToken(token: string): Promise<SupabaseClaims> {
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: env.SUPABASE_JWT_ISSUER,
        audience: env.SUPABASE_JWT_AUDIENCE,
      });

      if (!payload.sub) {
        throw new UnauthorizedError('Invalid Supabase token');
      }

      return payload as SupabaseClaims;
    } catch (error) {
      logger.warn(
        {
          err: error,
          issuer: env.SUPABASE_JWT_ISSUER,
          audience: env.SUPABASE_JWT_AUDIENCE,
        },
        'Failed to verify Supabase token',
      );
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private async resolveOrProvisionUser(claims: SupabaseClaims) {
    const now = new Date();
    const email = claims.email?.trim().toLowerCase();
    const emailVerified = this.isEmailVerified(claims);

    if (!email) {
      throw new UnauthorizedError('Supabase token does not include an email address');
    }

    const provider = this.mapProviderEnum(claims.app_metadata?.provider);
    const providerUserId = claims.sub;

    const existingProviderIdentity = await prisma.authIdentity.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { user: { include: { tenant: true, authIdentities: true } } },
    });

    if (existingProviderIdentity) {
      await this.touchIdentity(existingProviderIdentity.user.id, existingProviderIdentity.id, claims, now);
      return this.getUserWithRelations(existingProviderIdentity.user.id);
    }

    const linkedSupabaseIdentity = await prisma.authIdentity.findFirst({
      where: { supabaseUserId: claims.sub },
      include: { user: { include: { tenant: true, authIdentities: true } } },
    });

    if (linkedSupabaseIdentity) {
      await prisma.authIdentity.create({
        data: {
          userId: linkedSupabaseIdentity.user.id,
          supabaseUserId: claims.sub,
          provider,
          providerUserId,
          email,
          lastUsedAt: now,
        },
      });

      await this.touchUser(linkedSupabaseIdentity.user.id, claims, now);
      return this.getUserWithRelations(linkedSupabaseIdentity.user.id);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true, authIdentities: true },
    });

    if (existingUser) {
      await prisma.$transaction([
        prisma.authIdentity.create({
          data: {
            userId: existingUser.id,
            supabaseUserId: claims.sub,
            provider,
            providerUserId,
            email,
            lastUsedAt: now,
          },
        }),
        prisma.user.update({
          where: { id: existingUser.id },
          data: this.userUpdateDataFromClaims(claims, now),
        }),
      ]);

      logger.info(
        { userId: existingUser.id, provider, email, emailVerified },
        'Linked Supabase identity to existing local user',
      );
      return this.getUserWithRelations(existingUser.id);
    }

    logger.info(
      { email, provider, emailVerified, supabaseUserId: claims.sub },
      'No local user found for Supabase identity, provisioning owner workspace',
    );

    const tenantName = this.deriveTenantName(claims, email);
    const slug = await this.generateUniqueSlug(tenantName);
    const displayName = this.deriveDisplayName(claims, email);
    const avatarUrl = this.deriveAvatarUrl(claims);

    const createdUser = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash: null,
          name: displayName,
          role: 'OWNER',
          status: 'ACTIVE',
          avatarUrl,
          emailVerified,
          lastLoginAt: now,
          tenantId: tenant.id,
        },
      });

      await tx.authIdentity.create({
        data: {
          userId: user.id,
          supabaseUserId: claims.sub,
          provider,
          providerUserId,
          email,
          lastUsedAt: now,
        },
      });

      logger.info({ userId: user.id, tenantId: tenant.id, provider, email }, 'Provisioned local user from Supabase identity');
      return user;
    });

    return this.getUserWithRelations(createdUser.id);
  }

  private async touchIdentity(userId: string, identityId: string, claims: SupabaseClaims, now: Date) {
    await prisma.$transaction([
      prisma.authIdentity.update({
        where: { id: identityId },
        data: {
          email: claims.email?.trim().toLowerCase(),
          lastUsedAt: now,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: this.userUpdateDataFromClaims(claims, now),
      }),
    ]);
  }

  private async touchUser(userId: string, claims: SupabaseClaims, now: Date) {
    await prisma.user.update({
      where: { id: userId },
      data: this.userUpdateDataFromClaims(claims, now),
    });
  }

  private userUpdateDataFromClaims(claims: SupabaseClaims, now: Date) {
    return {
      name: this.deriveDisplayName(claims, claims.email ?? ''),
      avatarUrl: this.deriveAvatarUrl(claims),
      emailVerified: this.isEmailVerified(claims),
      status: 'ACTIVE',
      lastLoginAt: now,
    } as const;
  }

  private isEmailVerified(claims: SupabaseClaims): boolean {
    return claims.email_verified === true
      || claims.email_verified === 'true'
      || typeof claims.email_confirmed_at === 'string';
  }

  private async getUserWithRelations(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, authIdentities: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  private deriveDisplayName(claims: SupabaseClaims, email: string): string {
    return claims.user_metadata?.full_name
      ?? claims.user_metadata?.name
      ?? email.split('@')[0]
      ?? 'Rovty User';
  }

  private deriveTenantName(claims: SupabaseClaims, email: string): string {
    return claims.user_metadata?.tenantName
      ?? claims.user_metadata?.workspaceName
      ?? claims.user_metadata?.organizationName
      ?? `${this.deriveDisplayName(claims, email)} Workspace`;
  }

  private deriveAvatarUrl(claims: SupabaseClaims): string | null {
    return claims.user_metadata?.avatar_url
      ?? claims.user_metadata?.picture
      ?? null;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'workspace';

    let slug = base;
    let suffix = 1;

    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`.slice(0, 50);
      suffix += 1;
    }

    return slug;
  }

  private getPermissions(role: string): string[] {
    return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS['VIEWER'] ?? [];
  }

  private mapProviderEnum(provider?: string): 'EMAIL' | 'GOOGLE' | 'MICROSOFT' | 'SSO' | 'OIDC' | 'SAML' | 'UNKNOWN' {
    switch (provider) {
      case 'google':
        return 'GOOGLE';
      case 'azure':
        return 'MICROSOFT';
      case 'email':
        return 'EMAIL';
      case 'sso':
        return 'SSO';
      case 'oidc':
        return 'OIDC';
      case 'saml':
        return 'SAML';
      default:
        return 'UNKNOWN';
    }
  }

  private mapProviderLabel(provider?: string): string {
    switch (provider) {
      case 'google':
        return 'google';
      case 'azure':
        return 'microsoft';
      case 'email':
        return 'email';
      case 'sso':
      case 'oidc':
      case 'saml':
        return provider;
      default:
        return 'unknown';
    }
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
