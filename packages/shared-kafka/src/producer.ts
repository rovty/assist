import type { Kafka, Producer } from 'kafkajs';
import { createLogger, generateId } from '@assist/shared-utils';
import type { BaseEvent } from '@assist/shared-types';
import type { TopicName } from './topics.js';

const logger = createLogger('kafka-producer');

export interface EventProducer {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<T extends BaseEvent>(topic: TopicName, event: Omit<T, 'eventId' | 'timestamp' | 'version'>): Promise<void>;
  publishBatch(messages: Array<{ topic: TopicName; event: Omit<BaseEvent, 'eventId' | 'timestamp' | 'version'> }>): Promise<void>;
}

export function createProducer(kafka: Kafka, source: string): EventProducer {
  let producer: Producer | null = null;

  return {
    async connect() {
      producer = kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });
      await producer.connect();
      logger.info({ source }, 'Kafka producer connected');
    },

    async disconnect() {
      if (producer) {
        await producer.disconnect();
        producer = null;
        logger.info({ source }, 'Kafka producer disconnected');
      }
    },

    async publish<T extends BaseEvent>(topic: TopicName, event: Omit<T, 'eventId' | 'timestamp' | 'version'>) {
      if (!producer) throw new Error('Producer not connected');

      const fullEvent: BaseEvent = {
        eventId: generateId('evt'),
        timestamp: new Date().toISOString(),
        version: 1,
        ...event,
      } as BaseEvent;

      await producer.send({
        topic,
        messages: [
          {
            key: fullEvent.tenantId,
            value: JSON.stringify(fullEvent),
            headers: {
              eventType: fullEvent.eventType,
              source,
              timestamp: fullEvent.timestamp,
            },
          },
        ],
      });

      logger.debug({ topic, eventType: fullEvent.eventType, tenantId: fullEvent.tenantId }, 'Event published');
    },

    async publishBatch(messages) {
      if (!producer) throw new Error('Producer not connected');

      const topicMessages = messages.map(({ topic, event }) => {
        const fullEvent: BaseEvent = {
          eventId: generateId('evt'),
          timestamp: new Date().toISOString(),
          version: 1,
          ...event,
        } as BaseEvent;

        return {
          topic,
          messages: [
            {
              key: fullEvent.tenantId,
              value: JSON.stringify(fullEvent),
              headers: {
                eventType: fullEvent.eventType,
                source,
                timestamp: fullEvent.timestamp,
              },
            },
          ],
        };
      });

      await producer.sendBatch({ topicMessages });
      logger.debug({ count: messages.length }, 'Batch events published');
    },
  };
}
