import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

import { createLogger, ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '@assist/shared-utils';
import type { JwtPayload } from '@assist/shared-types';

import { prisma } from '../utils/db.js';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema.js';

const logger = createLogger('auth-service');

export class AuthService {
  /**
   * Register a new user and create their tenant (workspace).
   * This is the primary onboarding flow.
   */
  async register(input: RegisterInput) {
    const { email, password, name, tenantName } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Generate slug from tenant name
    const slug = this.generateSlug(tenantName);
    const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
    if (existingTenant) {
      throw new ConflictError('A workspace with this name already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create tenant + user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: 'OWNER',
          status: 'ACTIVE',
          emailVerified: false,
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id, result.tenant.id, result.user.email, result.user.role);

    logger.info({ userId: result.user.id, tenantId: result.tenant.id }, 'User registered');

    return {
      user: this.sanitizeUser(result.user),
      tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
      ...tokens,
    };
  }

  /**
   * Authenticate a user with email and password
   */
  async login(input: LoginInput, meta?: { ip?: string; userAgent?: string }) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active. Please contact support.');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.tenantId, user.email, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + this.parseExpiry(env.REFRESH_TOKEN_EXPIRY)),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info({ userId: user.id }, 'User logged in');

    return {
      user: this.sanitizeUser(user),
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
      ...tokens,
    };
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { tenant: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Rotate: revoke old token, create new one
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.tenantId,
      storedToken.user.email,
      storedToken.user.role,
    );

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: storedToken.userId,
          expiresAt: new Date(Date.now() + this.parseExpiry(env.REFRESH_TOKEN_EXPIRY)),
          userAgent: storedToken.userAgent,
          ipAddress: storedToken.ipAddress,
        },
      }),
    ]);

    return {
      user: this.sanitizeUser(storedToken.user),
      ...tokens,
    };
  }

  /**
   * Logout — revoke a refresh token and blacklist the access token
   */
  async logout(userId: string, refreshToken?: string, accessToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revokedAt: new Date() },
      });
    }

    // Blacklist the access token in Redis until it expires
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as JwtPayload | null;
        if (decoded?.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await redis.setex(`bl:${accessToken}`, ttl, '1');
          }
        }
      } catch {
        // Ignore decode errors
      }
    }

    logger.info({ userId }, 'User logged out');
  }

  /**
   * Verify a JWT access token
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    // Check blacklist
    const blacklisted = await redis.get(`bl:${token}`);
    if (blacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      return payload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return {
      user: this.sanitizeUser(user),
      tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens (force re-login)
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    logger.info({ userId }, 'Password changed');
  }

  // ─── Private helpers ───

  private async generateTokens(userId: string, tenantId: string, email: string, role: string) {
    const payload = { sub: userId, tenantId, email, role };
    const accessToken = jwt.sign(
      payload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY } as jwt.SignOptions,
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: { id: string; email: string; name: string; role: string; status: string; avatarUrl: string | null; lastLoginAt: Date | null; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // 7 days default

    const [, value, unit] = match;
    const num = parseInt(value!, 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return num * (multipliers[unit!] || 1000);
  }
}

export const authService = new AuthService();
