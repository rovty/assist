import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { createLogger, AppError } from '@assist/shared-utils';

const logger = createLogger('bot-builder:error');

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details,
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.validation,
    });
  }

  logger.error(error, 'Unhandled error');
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
