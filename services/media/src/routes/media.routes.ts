import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { extractTenantContext } from '../middleware/auth.js';
import { listMediaSchema } from '../schemas/media.schema.js';
import {
  saveFile,
  getFile,
  getFileBuffer,
  deleteFile,
  listFiles,
  getStorageQuota,
} from '../services/storage.service.js';

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', extractTenantContext);

  // ─── Upload File ───
  app.post('/upload', async (request, reply) => {
    const parts = request.parts();
    const uploadedFiles = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const stored = await saveFile(
          request.tenantContext.tenantId,
          request.tenantContext.userId,
          part.filename,
          part.mimetype,
          buffer,
        );

        uploadedFiles.push({
          id: stored.id,
          url: stored.url,
          fileName: stored.originalName,
          mimeType: stored.mimeType,
          size: stored.size,
          type: stored.type,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      reply.code(400).send({ error: 'BAD_REQUEST', message: 'No files uploaded' });
      return;
    }

    reply.code(201).send(success(uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles));
  });

  // ─── List Files ───
  app.get('/', async (request, reply) => {
    const query = listMediaSchema.parse(request.query);
    const { data, total } = await listFiles(request.tenantContext.tenantId, query);
    reply.send(
      success({
        data,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      }),
    );
  });

  // ─── Get File Metadata ───
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const file = await getFile(request.tenantContext.tenantId, request.params.id);
    if (!file) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File not found' });
      return;
    }
    reply.send(success(file));
  });

  // ─── Download File ───
  app.get<{ Params: { id: string } }>('/:id/download', async (request, reply) => {
    const file = await getFile(request.tenantContext.tenantId, request.params.id);
    if (!file) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File not found' });
      return;
    }

    const buffer = await getFileBuffer(request.tenantContext.tenantId, request.params.id);
    if (!buffer) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File content not available' });
      return;
    }

    reply
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `inline; filename="${file.originalName}"`)
      .header('Content-Length', buffer.length)
      .send(buffer);
  });

  // ─── Get File Content (for internal services like KB) ───
  app.get<{ Params: { id: string } }>('/:id/content', async (request, reply) => {
    const file = await getFile(request.tenantContext.tenantId, request.params.id);
    if (!file) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File not found' });
      return;
    }

    const buffer = await getFileBuffer(request.tenantContext.tenantId, request.params.id);
    if (!buffer) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File content not available' });
      return;
    }

    reply.header('Content-Type', file.mimeType).send(buffer);
  });

  // ─── Delete File ───
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const deleted = await deleteFile(request.tenantContext.tenantId, request.params.id);
    if (!deleted) {
      reply.code(404).send({ error: 'NOT_FOUND', message: 'File not found' });
      return;
    }
    reply.code(204).send();
  });

  // ─── Storage Quota ───
  app.get('/quota', async (request, reply) => {
    const quota = await getStorageQuota(request.tenantContext.tenantId);
    reply.send(success(quota));
  });
}
