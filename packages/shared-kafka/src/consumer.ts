import type { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { createLogger } from '@assist/shared-utils';
import type { TopicName } from './topics.js';

const logger = createLogger('kafka-consumer');

export type MessageHandler = (payload: {
  topic: string;
  partition: number;
  message: {
    key: string | null;
    value: Record<string, unknown>;
    headers: Record<string, string | undefined>;
    offset: string;
    timestamp: string;
  };
}) => Promise<void>;

export interface EventConsumer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topics: TopicName[], handler: MessageHandler): Promise<void>;
}

export function createConsumer(kafka: Kafka, groupId: string): EventConsumer {
  let consumer: Consumer | null = null;

  return {
    async connect() {
      consumer = kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 10000,
        maxBytesPerPartition: 1048576, // 1MB
      });
      await consumer.connect();
      logger.info({ groupId }, 'Kafka consumer connected');
    },

    async disconnect() {
      if (consumer) {
        await consumer.disconnect();
        consumer = null;
        logger.info({ groupId }, 'Kafka consumer disconnected');
      }
    },

    async subscribe(topics: TopicName[], handler: MessageHandler) {
      if (!consumer) throw new Error('Consumer not connected');

      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }

      await consumer.run({
        eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
          const key = message.key?.toString() ?? null;
          const rawValue = message.value?.toString();

          if (!rawValue) {
            logger.warn({ topic, partition, offset: message.offset }, 'Empty message received');
            return;
          }

          try {
            const value = JSON.parse(rawValue) as Record<string, unknown>;
            const headers: Record<string, string | undefined> = {};
            if (message.headers) {
              for (const [k, v] of Object.entries(message.headers)) {
                headers[k] = v?.toString();
              }
            }

            await handler({
              topic,
              partition,
              message: {
                key,
                value,
                headers,
                offset: message.offset,
                timestamp: message.timestamp,
              },
            });
          } catch (err) {
            logger.error({ err, topic, partition, offset: message.offset }, 'Error processing message');
          }
        },
      });

      logger.info({ topics, groupId }, 'Consumer subscribed and running');
    },
  };
}
