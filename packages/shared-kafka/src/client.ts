import { Kafka, logLevel } from 'kafkajs';
import { createLogger } from '@assist/shared-utils';

const logger = createLogger('kafka-client');

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
}

const kafkaLogLevels: Record<string, logLevel> = {
  ERROR: logLevel.ERROR,
  WARN: logLevel.WARN,
  INFO: logLevel.INFO,
  DEBUG: logLevel.DEBUG,
};

export function createKafkaClient(config: KafkaConfig): Kafka {
  const kafka = new Kafka({
    clientId: config.clientId,
    brokers: config.brokers,
    logLevel: kafkaLogLevels[config.logLevel ?? 'WARN'] ?? logLevel.WARN,
    retry: {
      initialRetryTime: 300,
      retries: 10,
      maxRetryTime: 30000,
    },
  });

  logger.info({ clientId: config.clientId, brokers: config.brokers }, 'Kafka client created');
  return kafka;
}
