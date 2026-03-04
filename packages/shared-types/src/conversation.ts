// ─── Conversation Types ───
export interface Conversation {
  id: string;
  tenantId: string;
  contactId: string;
  channel: ChannelType;
  status: ConversationStatus;
  assignedAgentId?: string;
  teamId?: string;
  tags: string[];
  priority: Priority;
  aiConfidence?: number;
  sentimentScore?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export enum ConversationStatus {
  NEW = 'new',
  AI_ACTIVE = 'ai_active',
  QUEUED = 'queued',
  ASSIGNED = 'assigned',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export type ChannelType =
  | 'web'
  | 'whatsapp'
  | 'messenger'
  | 'instagram'
  | 'telegram'
  | 'sms'
  | 'email'
  | 'slack'
  | 'line'
  | 'viber';

export interface Message {
  id: string;
  conversationId: string;
  tenantId: string;
  sender: MessageSender;
  content: MessageContent;
  aiMetadata?: AiMessageMetadata;
  readBy: ReadReceipt[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface MessageSender {
  type: 'contact' | 'ai' | 'agent' | 'system';
  id: string;
  name?: string;
}

export interface MessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'template' | 'interactive' | 'system';
  text?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  location?: { lat: number; lng: number };
  buttons?: Array<{ id: string; label: string; action?: string }>;
  templateId?: string;
}

export interface AiMessageMetadata {
  model: string;
  confidence: number;
  intent?: string;
  sentiment?: number;
  sources?: Array<{ chunkId: string; score: number; text?: string }>;
  tokensUsed?: { prompt: number; completion: number; total: number };
  responseTimeMs: number;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}
