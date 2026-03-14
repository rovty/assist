import { createClient } from '@clickhouse/client';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('analytics:clickhouse');

export const clickhouse = createClient({
  url: env.CLICKHOUSE_URL,
  database: env.CLICKHOUSE_DATABASE,
  username: env.CLICKHOUSE_USER,
  password: env.CLICKHOUSE_PASSWORD,
});

export async function initClickHouse() {
  try {
    // Create database if not exists
    await clickhouse.command({
      query: `CREATE DATABASE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}`,
    });

    // Events table — raw event stream
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.events (
          tenant_id   String,
          event_type  String,
          event_data  String,
          user_id     String DEFAULT '',
          session_id  String DEFAULT '',
          channel     String DEFAULT '',
          created_at  DateTime64(3) DEFAULT now64(3)
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(created_at)
        ORDER BY (tenant_id, event_type, created_at)
        TTL toDateTime(created_at) + INTERVAL 90 DAY
      `,
    });

    // Conversation metrics — materialized daily
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.conversation_metrics (
          tenant_id           String,
          date                Date,
          total_conversations UInt64 DEFAULT 0,
          resolved            UInt64 DEFAULT 0,
          escalated           UInt64 DEFAULT 0,
          avg_duration_sec    Float64 DEFAULT 0,
          avg_messages        Float64 DEFAULT 0,
          avg_csat            Float64 DEFAULT 0,
          channel             String DEFAULT ''
        ) ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (tenant_id, date, channel)
      `,
    });

    // Agent performance metrics
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.agent_metrics (
          tenant_id            String,
          agent_id             String,
          date                 Date,
          conversations_handled UInt64 DEFAULT 0,
          avg_response_time_sec Float64 DEFAULT 0,
          avg_resolution_time_sec Float64 DEFAULT 0,
          csat_score           Float64 DEFAULT 0,
          messages_sent        UInt64 DEFAULT 0
        ) ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (tenant_id, agent_id, date)
      `,
    });

    // AI metrics
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.ai_metrics (
          tenant_id            String,
          date                 Date,
          total_suggestions    UInt64 DEFAULT 0,
          accepted_suggestions UInt64 DEFAULT 0,
          auto_resolved        UInt64 DEFAULT 0,
          avg_confidence       Float64 DEFAULT 0,
          tokens_used          UInt64 DEFAULT 0,
          kb_queries           UInt64 DEFAULT 0
        ) ENGINE = SummingMergeTree()
        PARTITION BY toYYYYMM(date)
        ORDER BY (tenant_id, date)
      `,
    });

    logger.info('ClickHouse tables initialized');
  } catch (err) {
    logger.warn(err, 'ClickHouse init failed — running in mock mode');
  }
}

export async function insertEvents(events: Array<Record<string, unknown>>) {
  try {
    await clickhouse.insert({
      table: `${env.CLICKHOUSE_DATABASE}.events`,
      values: events,
      format: 'JSONEachRow',
    });
  } catch (err) {
    logger.error(err, 'Failed to insert events into ClickHouse');
  }
}
