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
  | LeadCapturedEvent;
