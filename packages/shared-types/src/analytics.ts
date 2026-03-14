// ─── Analytics Types ───

export enum MetricPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface AnalyticsOverview {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  avgResponseTimeMs: number;
  avgResolutionTimeMs: number;
  aiResolutionRate: number;
  totalMessages: number;
  totalContacts: number;
  newContactsToday: number;
  csat?: number;
  period: MetricPeriod;
}

export interface ConversationMetrics {
  date: string;
  total: number;
  aiResolved: number;
  agentResolved: number;
  escalated: number;
  avgResponseTimeMs: number;
  avgResolutionTimeMs: number;
  channelBreakdown: Record<string, number>;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  totalConversations: number;
  resolvedConversations: number;
  avgResponseTimeMs: number;
  avgResolutionTimeMs: number;
  avgCsat?: number;
  activeNow: boolean;
}

export interface ChannelMetrics {
  channel: string;
  totalConversations: number;
  totalMessages: number;
  avgResponseTimeMs: number;
  contactCount: number;
}

export interface AiMetrics {
  totalRequests: number;
  totalTokensUsed: number;
  avgConfidence: number;
  avgResponseTimeMs: number;
  resolutionRate: number;
  escalationRate: number;
  topIntents: Array<{ intent: string; count: number }>;
}

export interface AnalyticsEvent {
  eventId: string;
  tenantId: string;
  eventType: string;
  entityId?: string;
  entityType?: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsQuery {
  tenantId: string;
  startDate: string;
  endDate: string;
  period: MetricPeriod;
  channel?: string;
  agentId?: string;
}
