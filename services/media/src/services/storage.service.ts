import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { createLogger, generateId } from '@assist/shared-utils';
import { MediaType, ALLOWED_MIME_TYPES, MAX_FILE_SIZES } from '@assist/shared-types';
import { env } from '../env.js';
import { redis } from '../utils/redis.js';

const logger = createLogger('storage-service');

const MEDIA_KEY_PREFIX = 'media:';

export interface StoredFile {
  id: string;
  tenantId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  storage: string;
  path: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

// ─── File Type Detection ───

export function detectMediaType(mimeType: string): MediaType {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as MediaType;
    }
  }
  return MediaType.OTHER;
}

export function validateFile(mimeType: string, size: number): { valid: boolean; error?: string } {
  const type = detectMediaType(mimeType);
  const maxSize = MAX_FILE_SIZES[type];

  if (size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${type}: ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check if mime type is allowed at all
  const allAllowed = Object.values(ALLOWED_MIME_TYPES).flat();
  if (!allAllowed.includes(mimeType) && type === MediaType.OTHER) {
    // Allow OTHER types under size limit
    return { valid: true };
  }

  return { valid: true };
}

// ─── Local Storage ───

async function ensureUploadDir(tenantId: string): Promise<string> {
  const dir = path.join(env.LOCAL_STORAGE_PATH, tenantId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveFile(
  tenantId: string,
  uploadedBy: string,
  originalName: string,
  mimeType: string,
  buffer: Buffer,
): Promise<StoredFile> {
  const validation = validateFile(mimeType, buffer.length);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const id = generateId('file');
  const ext = path.extname(originalName) || '';
  const fileName = `${id}${ext}`;
  const type = detectMediaType(mimeType);

  let filePath: string;
  let url: string;

  if (env.STORAGE_PROVIDER === 'local') {
    const dir = await ensureUploadDir(tenantId);
    filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);
    url = `/media/${id}/download`;
  } else {
    // Azure Blob Storage placeholder
    filePath = `${tenantId}/${fileName}`;
    url = `https://${env.AZURE_STORAGE_CONTAINER}.blob.core.windows.net/${filePath}`;
    // TODO: Implement Azure Blob upload
    logger.warn('Azure Blob upload not yet implemented, falling back to local');
    const dir = await ensureUploadDir(tenantId);
    filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);
    url = `/media/${id}/download`;
  }

  const storedFile: StoredFile = {
    id,
    tenantId,
    fileName,
    originalName,
    mimeType,
    size: buffer.length,
    type,
    storage: env.STORAGE_PROVIDER,
    path: filePath,
    url,
    uploadedBy,
    createdAt: new Date().toISOString(),
  };

  // Store metadata in Redis
  await redis.hset(
    `${MEDIA_KEY_PREFIX}${tenantId}`,
    id,
    JSON.stringify(storedFile),
  );

  // Track storage usage
  await redis.hincrby(`${MEDIA_KEY_PREFIX}usage:${tenantId}`, 'bytes', buffer.length);
  await redis.hincrby(`${MEDIA_KEY_PREFIX}usage:${tenantId}`, 'count', 1);

  logger.info({ fileId: id, tenantId, size: buffer.length, type }, 'File uploaded');
  return storedFile;
}

export async function getFile(tenantId: string, fileId: string): Promise<StoredFile | null> {
  const data = await redis.hget(`${MEDIA_KEY_PREFIX}${tenantId}`, fileId);
  return data ? (JSON.parse(data) as StoredFile) : null;
}

export async function getFileBuffer(tenantId: string, fileId: string): Promise<Buffer | null> {
  const file = await getFile(tenantId, fileId);
  if (!file) return null;

  if (env.STORAGE_PROVIDER === 'local') {
    try {
      return await fs.readFile(file.path);
    } catch {
      return null;
    }
  }

  // Azure Blob fallback
  return null;
}

export async function deleteFile(tenantId: string, fileId: string): Promise<boolean> {
  const file = await getFile(tenantId, fileId);
  if (!file) return false;

  // Delete physical file
  if (env.STORAGE_PROVIDER === 'local') {
    try {
      await fs.unlink(file.path);
    } catch {
      logger.warn({ fileId, path: file.path }, 'Failed to delete physical file');
    }
  }

  // Remove metadata
  await redis.hdel(`${MEDIA_KEY_PREFIX}${tenantId}`, fileId);

  // Update usage
  await redis.hincrby(`${MEDIA_KEY_PREFIX}usage:${tenantId}`, 'bytes', -file.size);
  await redis.hincrby(`${MEDIA_KEY_PREFIX}usage:${tenantId}`, 'count', -1);

  logger.info({ fileId, tenantId }, 'File deleted');
  return true;
}

export async function listFiles(
  tenantId: string,
  opts: { page: number; pageSize: number; type?: string },
): Promise<{ data: StoredFile[]; total: number }> {
  const allData = await redis.hgetall(`${MEDIA_KEY_PREFIX}${tenantId}`);
  let files = Object.values(allData)
    .map((v) => JSON.parse(v) as StoredFile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (opts.type) {
    files = files.filter((f) => f.type === opts.type);
  }

  const total = files.length;
  const start = (opts.page - 1) * opts.pageSize;
  const paginated = files.slice(start, start + opts.pageSize);

  return { data: paginated, total };
}

export async function getStorageQuota(tenantId: string) {
  const usage = await redis.hgetall(`${MEDIA_KEY_PREFIX}usage:${tenantId}`);
  const usedBytes = parseInt(usage.bytes ?? '0', 10);
  const fileCount = parseInt(usage.count ?? '0', 10);
  const limitBytes = 1024 * 1024 * 1024; // 1GB default

  return {
    usedBytes,
    limitBytes,
    usedPercent: Math.round((usedBytes / limitBytes) * 100),
    fileCount,
  };
}
