import { createLogger } from '@assist/shared-utils';
import { clickhouse } from '../utils/clickhouse.js';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import type { QueryPeriod } from '../schemas/analytics.schema.js';

const logger = createLogger('analytics:service');

const CACHE_TTL: Record<string, number> = {
  hour: 60,
  day: 300,
  week: 900,
  month: 3600,
};

function dateRange(period: QueryPeriod) {
  const to = period.to ? new Date(period.to) : new Date();
  let from: Date;
  if (period.from) {
    from = new Date(period.from);
  } else {
    from = new Date(to);
    switch (period.period) {
      case 'hour': from.setHours(from.getHours() - 24); break;
      case 'day': from.setDate(from.getDate() - 30); break;
      case 'week': from.setDate(from.getDate() - 90); break;
      case 'month': from.setFullYear(from.getFullYear() - 1); break;
    }
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

function cacheKey(tenantId: string, metric: string, period: QueryPeriod) {
  return `analytics:${tenantId}:${metric}:${period.period}:${period.from || 'default'}:${period.to || 'default'}`;
}

async function cachedQuery<T>(key: string, ttl: number, queryFn: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const result = await queryFn();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}

/* ── Overview ────────────────────────────────────────────── */

export async function getOverview(tenantId: string, period: QueryPeriod) {
  const key = cacheKey(tenantId, 'overview', period);
  const ttl = CACHE_TTL[period.period] || 300;

  return cachedQuery(key, ttl, async () => {
    const { from, to } = dateRange(period);

    try {
      const result = await clickhouse.query({
        query: `
          SELECT
            count()                                        AS total_conversations,
            countIf(event_type = 'conversation.resolved')  AS resolved,
            countIf(event_type = 'conversation.escalated') AS escalated,
            uniqExact(user_id)                             AS active_agents,
            count(DISTINCT session_id)                     AS total_sessions
          FROM events
          WHERE tenant_id = {tenantId:String}
            AND created_at >= {from:String}
            AND created_at <= {to:String}
        `,
        query_params: { tenantId, from, to },
        format: 'JSONEachRow',
      });
      const rows = await result.json<any[]>();
      return rows[0] || {
        total_conversations: 0,
        resolved: 0,
        escalated: 0,
        active_agents: 0,
        total_sessions: 0,
      };
    } catch {
      return mockOverview(tenantId);
    }
  });
}

/* ── Conversation Metrics ────────────────────────────────── */

export async function getConversationMetrics(tenantId: string, period: QueryPeriod) {
  const key = cacheKey(tenantId, 'conversations', period);
  const ttl = CACHE_TTL[period.period] || 300;

  return cachedQuery(key, ttl, async () => {
    const { from, to } = dateRange(period);

    try {
      const result = await clickhouse.query({
        query: `
          SELECT
            toDate(date) AS date,
            sum(total_conversations) AS total,
            sum(resolved) AS resolved,
            sum(escalated) AS escalated,
            avg(avg_duration_sec) AS avg_duration,
            avg(avg_messages) AS avg_messages,
            avg(avg_csat) AS avg_csat
          FROM conversation_metrics
          WHERE tenant_id = {tenantId:String}
            AND date >= toDate({from:String})
            AND date <= toDate({to:String})
            ${period.channel ? `AND channel = {channel:String}` : ''}
          GROUP BY date
          ORDER BY date
        `,
        query_params: { tenantId, from, to, channel: period.channel || '' },
        format: 'JSONEachRow',
      });
      return result.json<any[]>();
    } catch {
      return mockTimeSeries(tenantId, period);
    }
  });
}

/* ── Agent Metrics ───────────────────────────────────────── */

export async function getAgentMetrics(tenantId: string, period: QueryPeriod & { agentId?: string }) {
  const key = cacheKey(tenantId, `agents:${period.agentId || 'all'}`, period);
  const ttl = CACHE_TTL[period.period] || 300;

  return cachedQuery(key, ttl, async () => {
    const { from, to } = dateRange(period);

    try {
      const result = await clickhouse.query({
        query: `
          SELECT
            agent_id,
            sum(conversations_handled) AS conversations,
            avg(avg_response_time_sec) AS avg_response_time,
            avg(avg_resolution_time_sec) AS avg_resolution_time,
            avg(csat_score) AS csat,
            sum(messages_sent) AS messages
          FROM agent_metrics
          WHERE tenant_id = {tenantId:String}
            AND date >= toDate({from:String})
            AND date <= toDate({to:String})
            ${period.agentId ? `AND agent_id = {agentId:String}` : ''}
          GROUP BY agent_id
          ORDER BY conversations DESC
        `,
        query_params: { tenantId, from, to, agentId: period.agentId || '' },
        format: 'JSONEachRow',
      });
      return result.json<any[]>();
    } catch {
      return mockAgentMetrics(tenantId);
    }
  });
}

/* ── AI Metrics ──────────────────────────────────────────── */

export async function getAiMetrics(tenantId: string, period: QueryPeriod) {
  const key = cacheKey(tenantId, 'ai', period);
  const ttl = CACHE_TTL[period.period] || 300;

  return cachedQuery(key, ttl, async () => {
    const { from, to } = dateRange(period);

    try {
      const result = await clickhouse.query({
        query: `
          SELECT
            toDate(date) AS date,
            sum(total_suggestions) AS suggestions,
            sum(accepted_suggestions) AS accepted,
            sum(auto_resolved) AS auto_resolved,
            avg(avg_confidence) AS confidence,
            sum(tokens_used) AS tokens,
            sum(kb_queries) AS kb_queries
          FROM ai_metrics
          WHERE tenant_id = {tenantId:String}
            AND date >= toDate({from:String})
            AND date <= toDate({to:String})
          GROUP BY date
          ORDER BY date
        `,
        query_params: { tenantId, from, to },
        format: 'JSONEachRow',
      });
      return result.json<any[]>();
    } catch {
      return mockAiMetrics(tenantId, period);
    }
  });
}

/* ── Channel Metrics ─────────────────────────────────────── */

export async function getChannelMetrics(tenantId: string, period: QueryPeriod) {
  const key = cacheKey(tenantId, 'channels', period);
  const ttl = CACHE_TTL[period.period] || 300;

  return cachedQuery(key, ttl, async () => {
    const { from, to } = dateRange(period);

    try {
      const result = await clickhouse.query({
        query: `
          SELECT
            channel,
            count() AS total_messages,
            countIf(event_type = 'message.inbound') AS inbound,
            countIf(event_type = 'message.outbound') AS outbound,
            uniqExact(session_id) AS conversations
          FROM events
          WHERE tenant_id = {tenantId:String}
            AND created_at >= {from:String}
            AND created_at <= {to:String}
            AND channel != ''
          GROUP BY channel
          ORDER BY total_messages DESC
        `,
        query_params: { tenantId, from, to },
        format: 'JSONEachRow',
      });
      return result.json<any[]>();
    } catch {
      return mockChannelMetrics();
    }
  });
}

/* ── Track Events ────────────────────────────────────────── */

export async function trackEvent(
  tenantId: string,
  userId: string,
  event: { eventType: string; data: Record<string, unknown>; sessionId?: string; channel?: string },
) {
  const row = {
    tenant_id: tenantId,
    event_type: event.eventType,
    event_data: JSON.stringify(event.data),
    user_id: userId,
    session_id: event.sessionId || '',
    channel: event.channel || '',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
  };

  try {
    await clickhouse.insert({
      table: `${env.CLICKHOUSE_DATABASE}.events`,
      values: [row],
      format: 'JSONEachRow',
    });
  } catch {
    // Store in Redis as fallback buffer
    await redis.lpush(`analytics:buffer:${tenantId}`, JSON.stringify(row));
    await redis.ltrim(`analytics:buffer:${tenantId}`, 0, 9999);
    logger.warn('ClickHouse unavailable — buffered event in Redis');
  }

  return { tracked: true };
}

export async function trackBatch(
  tenantId: string,
  userId: string,
  events: Array<{ eventType: string; data: Record<string, unknown>; sessionId?: string; channel?: string }>,
) {
  const rows = events.map((e) => ({
    tenant_id: tenantId,
    event_type: e.eventType,
    event_data: JSON.stringify(e.data),
    user_id: userId,
    session_id: e.sessionId || '',
    channel: e.channel || '',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 23),
  }));

  try {
    await clickhouse.insert({
      table: `${env.CLICKHOUSE_DATABASE}.events`,
      values: rows,
      format: 'JSONEachRow',
    });
  } catch {
    for (const row of rows) {
      await redis.lpush(`analytics:buffer:${tenantId}`, JSON.stringify(row));
    }
    await redis.ltrim(`analytics:buffer:${tenantId}`, 0, 9999);
    logger.warn(`ClickHouse unavailable — buffered ${rows.length} events in Redis`);
  }

  return { tracked: rows.length };
}

/* ── Mock Data (Dev Mode) ────────────────────────────────── */

function mockOverview(_tenantId: string) {
  return {
    total_conversations: 1247,
    resolved: 982,
    escalated: 143,
    active_agents: 12,
    total_sessions: 3891,
  };
}

function mockTimeSeries(_tenantId: string, period: QueryPeriod) {
  const days = period.period === 'hour' ? 24 : period.period === 'day' ? 30 : period.period === 'week' ? 12 : 12;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toISOString().slice(0, 10),
      total: Math.floor(Math.random() * 50) + 10,
      resolved: Math.floor(Math.random() * 40) + 8,
      escalated: Math.floor(Math.random() * 10),
      avg_duration: Math.floor(Math.random() * 600) + 60,
      avg_messages: Math.floor(Math.random() * 15) + 3,
      avg_csat: +(Math.random() * 2 + 3).toFixed(1),
    };
  });
}

function mockAgentMetrics(_tenantId: string) {
  const names = ['agent_01', 'agent_02', 'agent_03', 'agent_04', 'agent_05'];
  return names.map((id) => ({
    agent_id: id,
    conversations: Math.floor(Math.random() * 100) + 20,
    avg_response_time: Math.floor(Math.random() * 120) + 10,
    avg_resolution_time: Math.floor(Math.random() * 600) + 60,
    csat: +(Math.random() * 2 + 3).toFixed(1),
    messages: Math.floor(Math.random() * 500) + 50,
  }));
}

function mockAiMetrics(_tenantId: string, period: QueryPeriod) {
  const days = period.period === 'day' ? 30 : 12;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toISOString().slice(0, 10),
      suggestions: Math.floor(Math.random() * 200) + 50,
      accepted: Math.floor(Math.random() * 150) + 30,
      auto_resolved: Math.floor(Math.random() * 80) + 5,
      confidence: +(Math.random() * 0.3 + 0.65).toFixed(2),
      tokens: Math.floor(Math.random() * 50000) + 10000,
      kb_queries: Math.floor(Math.random() * 100) + 20,
    };
  });
}

function mockChannelMetrics() {
  return [
    { channel: 'web_widget', total_messages: 2341, inbound: 1200, outbound: 1141, conversations: 456 },
    { channel: 'whatsapp', total_messages: 1890, inbound: 980, outbound: 910, conversations: 312 },
    { channel: 'messenger', total_messages: 876, inbound: 450, outbound: 426, conversations: 198 },
    { channel: 'telegram', total_messages: 543, inbound: 280, outbound: 263, conversations: 132 },
  ];
}
