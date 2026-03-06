export const TOPICS = {
  // Auth events
  USER_REGISTERED: 'assist.auth.user-registered',
  USER_LOGGED_IN: 'assist.auth.user-logged-in',

  // Tenant events
  TENANT_CREATED: 'assist.tenant.tenant-created',
  TENANT_PLAN_CHANGED: 'assist.tenant.plan-changed',
  MEMBER_INVITED: 'assist.tenant.member-invited',

  // Conversation events
  CONVERSATION_CREATED: 'assist.conversation.created',
  CONVERSATION_ASSIGNED: 'assist.conversation.assigned',
  CONVERSATION_ESCALATED: 'assist.conversation.escalated',
  CONVERSATION_RESOLVED: 'assist.conversation.resolved',
  CONVERSATION_CLOSED: 'assist.conversation.closed',

  // Message events
  MESSAGE_SENT: 'assist.conversation.message-sent',
  MESSAGE_READ: 'assist.conversation.message-read',

  // AI events
  AI_RESPONSE_GENERATED: 'assist.ai.response-generated',
  AI_ESCALATION_TRIGGERED: 'assist.ai.escalation-triggered',

  // Notification events
  NOTIFICATION_REQUESTED: 'assist.notification.requested',
  NOTIFICATION_SENT: 'assist.notification.sent',
  NOTIFICATION_FAILED: 'assist.notification.failed',

  // Analytics events (for ClickHouse ingestion)
  ANALYTICS_EVENT: 'assist.analytics.event',
} as const;

export type TopicName = (typeof TOPICS)[keyof typeof TOPICS];
