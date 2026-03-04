import pino from 'pino';

export function createLogger(service: string) {
  return pino({
    name: service,
    level: process.env['LOG_LEVEL'] || 'info',
    transport:
      process.env['NODE_ENV'] === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    base: {
      service,
      env: process.env['NODE_ENV'] || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
