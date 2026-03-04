import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { AppError, createLogger } from '@assist/shared-utils';

const logger = createLogger('tenant-error-handler');

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(error.toResponse());
  }

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.validation,
      },
    });
  }

  logger.error(error, 'Unhandled error');

  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env['NODE_ENV'] === 'development' ? error.message : 'An unexpected error occurred',
    },
  });
}
