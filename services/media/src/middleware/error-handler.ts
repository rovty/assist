import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { createLogger } from '@assist/shared-utils';

const logger = createLogger('error-handler');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      error: error.code ?? 'APP_ERROR',
      message: error.message,
    });
    return;
  }

  if (error.statusCode === 429) {
    reply.code(429).send({
      error: 'RATE_LIMIT',
      message: 'Too many requests, please try again later',
    });
    return;
  }

  if (error.validation) {
    reply.code(400).send({
      error: 'VALIDATION_ERROR',
      message: error.message,
    });
    return;
  }

  logger.error({ err: error, url: request.url }, 'Unhandled error');
  reply.code(500).send({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
