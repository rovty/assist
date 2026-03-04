import bcrypt from 'bcryptjs';

import { createLogger, generateApiKey, getKeyPrefix, NotFoundError } from '@assist/shared-utils';

import { prisma } from '../utils/db.js';
import type { CreateApiKeyInput } from '../schemas/api-key.schema.js';

const logger = createLogger('api-key-service');

export class ApiKeyService {
  /**
   * Create a new API key for a tenant
   * Returns the raw key only once — it's hashed before storage
   */
  async createApiKey(tenantId: string, userId: string, input: CreateApiKeyInput) {
    const rawKey = generateApiKey();
    const keyHash = await bcrypt.hash(rawKey, 10);
    const keyPrefix = getKeyPrefix(rawKey);

    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const apiKey = await prisma.apiKey.create({
      data: {
        tenantId,
        name: input.name,
        keyHash,
        keyPrefix,
        scopes: input.scopes,
        expiresAt,
        createdBy: userId,
      },
    });

    logger.info({ tenantId, apiKeyId: apiKey.id }, 'API key created');

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned once!
      keyPrefix,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  /**
   * List all API keys for a tenant (without the actual keys)
   */
  async listApiKeys(tenantId: string) {
    const keys = await prisma.apiKey.findMany({
      where: { tenantId, revokedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(tenantId: string, keyId: string) {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, tenantId },
    });

    if (!key) {
      throw new NotFoundError('API key', keyId);
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    logger.info({ tenantId, apiKeyId: keyId }, 'API key revoked');
  }

  /**
   * Verify an API key and return tenant info + scopes
   */
  async verifyApiKey(rawKey: string) {
    // Get all non-revoked, non-expired keys
    const keys = await prisma.apiKey.findMany({
      where: {
        keyPrefix: getKeyPrefix(rawKey),
        revokedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    for (const key of keys) {
      const valid = await bcrypt.compare(rawKey, key.keyHash);
      if (valid) {
        // Update last used
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });

        return {
          tenantId: key.tenantId,
          scopes: key.scopes,
          apiKeyId: key.id,
        };
      }
    }

    return null;
  }
}

export const apiKeyService = new ApiKeyService();
