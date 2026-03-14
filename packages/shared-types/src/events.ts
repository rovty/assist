// ─── Event Types ───
// Shared event contracts for Kafka communication between services

export interface BaseEvent {
  eventId: string;
  eventType: string;
  tenantId: string;
  timestamp: string; // ISO 8601
  version: number;
  source: string; // service name
}

// ─── Auth Events ───
export interface UserRegisteredEvent extends BaseEvent {
  eventType: 'user.registered';
  data: {
    userId: string;
    email: string;
    tenantId: string;
  };
}

export interface UserLoggedInEvent extends BaseEvent {
  eventType: 'user.logged_in';
  data: {
    userId: string;
    email: string;
    ip: string;
    userAgent: string;
  };
}

// ─── Tenant Events ───
export interface TenantCreatedEvent extends BaseEvent {
  eventType: 'tenant.created';
  data: {
    tenantId: string;
    name: string;
    planTier: string;
    ownerId: string;
  };
}

export interface TenantPlanChangedEvent extends BaseEvent {
  eventType: 'tenant.plan_changed';
  data: {
    tenantId: string;
    previousPlan: string;
    newPlan: string;
  };
}

// ─── Conversation Events ───
export interface ConversationCreatedEvent extends BaseEvent {
  eventType: 'conversation.created';
  data: {
    conversationId: string;
    contactId: string;
    channel: string;
  };
}

export interface MessageSentEvent extends BaseEvent {
  eventType: 'message.sent';
  data: {
    conversationId: string;
    messageId: string;
    senderType: 'contact' | 'ai' | 'agent';
    channel: string;
  };
}

export interface ConversationEscalatedEvent extends BaseEvent {
  eventType: 'conversation.escalated';
  data: {
    conversationId: string;
    reason: string;
    aiConfidence: number;
  };
}

// ─── AI Events ───
export interface AiResponseGeneratedEvent extends BaseEvent {
  eventType: 'ai.response_generated';
  data: {
    conversationId: string;
    messageId: string;
    model: string;
    confidence: number;
    tokensUsed: number;
    responseTimeMs: number;
  };
}

// ─── Lead Events ───
export interface LeadCapturedEvent extends BaseEvent {
  eventType: 'lead.captured';
  data: {
    contactId: string;
    conversationId: string;
    email?: string;
    phone?: string;
    score: number;
  };
}

// ─── Knowledge Base Events ───
export interface KBSourceCreatedEvent extends BaseEvent {
  eventType: 'kb.source_created';
  data: {
    sourceId: string;
    type: string;
    name: string;
  };
}

export interface KBSourceReadyEvent extends BaseEvent {
  eventType: 'kb.source_ready';
  data: {
    sourceId: string;
    chunkCount: number;
  };
}

export interface KBSourceFailedEvent extends BaseEvent {
  eventType: 'kb.source_failed';
  data: {
    sourceId: string;
    error: string;
  };
}

// ─── Media Events ───
export interface MediaUploadedEvent extends BaseEvent {
  eventType: 'media.uploaded';
  data: {
    fileId: string;
    fileName: string;
    mimeType: string;
    size: number;
    uploadedBy: string;
  };
}

// ─── Channel Events ───
export interface ChannelConnectedEvent extends BaseEvent {
  eventType: 'channel.connected';
  data: {
    connectionId: string;
    provider: string;
    name: string;
  };
}

export interface ChannelDisconnectedEvent extends BaseEvent {
  eventType: 'channel.disconnected';
  data: {
    connectionId: string;
    provider: string;
    reason: string;
  };
}

export interface ChannelMessageReceivedEvent extends BaseEvent {
  eventType: 'channel.message_received';
  data: {
    connectionId: string;
    provider: string;
    externalContactId: string;
    messageType: string;
  };
}

// ─── Analytics Events ───
export interface AnalyticsTrackEvent extends BaseEvent {
  eventType: 'analytics.track';
  data: {
    category: string;
    action: string;
    entityId?: string;
    entityType?: string;
    value?: number;
    properties: Record<string, unknown>;
  };
}

// ─── Bot Builder Events ───
export interface BotPublishedEvent extends BaseEvent {
  eventType: 'bot.published';
  data: {
    botId: string;
    version: number;
    name: string;
  };
}

export interface BotUnpublishedEvent extends BaseEvent {
  eventType: 'bot.unpublished';
  data: {
    botId: string;
    name: string;
  };
}

// ─── Lead/CRM Events ───
export interface LeadCreatedEvent extends BaseEvent {
  eventType: 'lead.created';
  data: {
    leadId: string;
    name: string;
    email?: string;
    source?: string;
  };
}

export interface LeadStageChangedEvent extends BaseEvent {
  eventType: 'lead.stage_changed';
  data: {
    leadId: string;
    pipelineId: string;
    previousStageId?: string;
    newStageId: string;
  };
}

export interface LeadScoredEvent extends BaseEvent {
  eventType: 'lead.scored';
  data: {
    leadId: string;
    previousScore: number;
    newScore: number;
  };
}

// ─── Scheduler Events ───
export interface JobExecutedEvent extends BaseEvent {
  eventType: 'scheduler.job_executed';
  data: {
    jobId: string;
    jobType: string;
    success: boolean;
  };
}

export interface SLABreachedEvent extends BaseEvent {
  eventType: 'scheduler.sla_breached';
  data: {
    conversationId: string;
    slaId: string;
    breachType: 'first_response' | 'resolution';
  };
}

// ─── Agent Workspace Events ───
export interface AgentStatusChangedEvent extends BaseEvent {
  eventType: 'workspace.agent_status_changed';
  data: {
    agentId: string;
    previousStatus: string;
    newStatus: string;
  };
}

export interface ConversationQueuedEvent extends BaseEvent {
  eventType: 'workspace.conversation_queued';
  data: {
    conversationId: string;
    priority: string;
    queueItemId: string;
  };
}

export interface ConversationRoutedEvent extends BaseEvent {
  eventType: 'workspace.conversation_routed';
  data: {
    conversationId: string;
    agentId: string;
    strategy: string;
  };
}

// ─── Billing Events ───
export interface SubscriptionCreatedEvent extends BaseEvent {
  eventType: 'billing.subscription_created';
  data: {
    planId: string;
    seats: number;
    stripeSubscriptionId: string;
  };
}

export interface SubscriptionCanceledEvent extends BaseEvent {
  eventType: 'billing.subscription_canceled';
  data: {
    planId: string;
    cancelAtPeriodEnd: boolean;
  };
}

export interface UsageLimitReachedEvent extends BaseEvent {
  eventType: 'billing.usage_limit_reached';
  data: {
    metric: string;
    current: number;
    limit: number;
  };
}

// Union type of all events
export type AssistEvent =
  | UserRegisteredEvent
  | UserLoggedInEvent
  | TenantCreatedEvent
  | TenantPlanChangedEvent
  | ConversationCreatedEvent
  | MessageSentEvent
  | ConversationEscalatedEvent
  | AiResponseGeneratedEvent
  | LeadCapturedEvent
  | KBSourceCreatedEvent
  | KBSourceReadyEvent
  | KBSourceFailedEvent
  | MediaUploadedEvent
  | ChannelConnectedEvent
  | ChannelDisconnectedEvent
  | ChannelMessageReceivedEvent
  | AnalyticsTrackEvent
  | BotPublishedEvent
  | BotUnpublishedEvent
  | LeadCreatedEvent
  | LeadStageChangedEvent
  | LeadScoredEvent
  | JobExecutedEvent
  | SLABreachedEvent
  | AgentStatusChangedEvent
  | ConversationQueuedEvent
  | ConversationRoutedEvent
  | SubscriptionCreatedEvent
  | SubscriptionCanceledEvent
  | UsageLimitReachedEvent;
