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

  // Knowledge Base events
  KB_SOURCE_CREATED: 'assist.kb.source-created',
  KB_SOURCE_PROCESSING: 'assist.kb.source-processing',
  KB_SOURCE_READY: 'assist.kb.source-ready',
  KB_SOURCE_FAILED: 'assist.kb.source-failed',
  KB_SOURCE_DELETED: 'assist.kb.source-deleted',
  KB_QUERY: 'assist.kb.query',

  // Media events
  MEDIA_UPLOADED: 'assist.media.uploaded',
  MEDIA_DELETED: 'assist.media.deleted',
  MEDIA_PROCESSED: 'assist.media.processed',

  // Channel events
  CHANNEL_CONNECTED: 'assist.channel.connected',
  CHANNEL_DISCONNECTED: 'assist.channel.disconnected',
  CHANNEL_MESSAGE_RECEIVED: 'assist.channel.message-received',
  CHANNEL_MESSAGE_SENT: 'assist.channel.message-sent',
  CHANNEL_MESSAGE_DELIVERED: 'assist.channel.message-delivered',
  CHANNEL_MESSAGE_READ: 'assist.channel.message-read',

  // Webhook events
  WEBHOOK_DELIVERY_REQUESTED: 'assist.webhook.delivery-requested',
  WEBHOOK_DELIVERED: 'assist.webhook.delivered',
  WEBHOOK_FAILED: 'assist.webhook.failed',

  // Analytics events (for ClickHouse ingestion)
  ANALYTICS_EVENT: 'assist.analytics.event',
  ANALYTICS_CONVERSATION: 'assist.analytics.conversation',
  ANALYTICS_AI_USAGE: 'assist.analytics.ai-usage',

  // Bot Builder events
  BOT_CREATED: 'assist.bot.created',
  BOT_UPDATED: 'assist.bot.updated',
  BOT_PUBLISHED: 'assist.bot.published',
  BOT_UNPUBLISHED: 'assist.bot.unpublished',
  BOT_DELETED: 'assist.bot.deleted',

  // Lead/CRM events
  LEAD_CREATED: 'assist.lead.created',
  LEAD_UPDATED: 'assist.lead.updated',
  LEAD_DELETED: 'assist.lead.deleted',
  LEAD_STAGE_CHANGED: 'assist.lead.stage-changed',
  LEAD_SCORED: 'assist.lead.scored',
  PIPELINE_CREATED: 'assist.lead.pipeline-created',
  PIPELINE_UPDATED: 'assist.lead.pipeline-updated',
  PIPELINE_DELETED: 'assist.lead.pipeline-deleted',

  // Scheduler events
  JOB_CREATED: 'assist.scheduler.job-created',
  JOB_EXECUTED: 'assist.scheduler.job-executed',
  JOB_FAILED: 'assist.scheduler.job-failed',
  JOB_PAUSED: 'assist.scheduler.job-paused',
  JOB_RESUMED: 'assist.scheduler.job-resumed',
  SLA_BREACHED: 'assist.scheduler.sla-breached',

  // Agent Workspace events
  AGENT_STATUS_CHANGED: 'assist.workspace.agent-status-changed',
  CONVERSATION_QUEUED: 'assist.workspace.conversation-queued',
  CONVERSATION_DEQUEUED: 'assist.workspace.conversation-dequeued',
  CONVERSATION_ROUTED: 'assist.workspace.conversation-routed',
  AGENT_SLOT_RELEASED: 'assist.workspace.agent-slot-released',

  // Billing events
  SUBSCRIPTION_CREATED: 'assist.billing.subscription-created',
  SUBSCRIPTION_UPDATED: 'assist.billing.subscription-updated',
  SUBSCRIPTION_CANCELED: 'assist.billing.subscription-canceled',
  INVOICE_PAID: 'assist.billing.invoice-paid',
  INVOICE_FAILED: 'assist.billing.invoice-failed',
  USAGE_RECORDED: 'assist.billing.usage-recorded',
  USAGE_LIMIT_REACHED: 'assist.billing.usage-limit-reached',
} as const;

export type TopicName = (typeof TOPICS)[keyof typeof TOPICS];
