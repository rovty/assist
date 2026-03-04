import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { AppError, createLogger } from '@assist/shared-utils';

const logger = createLogger('auth-error-handler');

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  // Handle our custom AppError
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(error.toResponse());
  }

  // Handle Zod validation errors
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

  // Handle Fastify rate limit
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
      },
    });
  }

  // Unexpected errors
  logger.error(error, 'Unhandled error');

  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env['NODE_ENV'] === 'development' ? error.message : 'An unexpected error occurred',
    },
  });
}
