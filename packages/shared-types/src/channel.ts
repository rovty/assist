// ─── Channel Types ───

export enum ChannelProvider {
  WEB = 'web',
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  SMS = 'sms',
  EMAIL = 'email',
  SLACK = 'slack',
  LINE = 'line',
  VIBER = 'viber',
}

export enum ChannelConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
}

export interface ChannelConnection {
  id: string;
  tenantId: string;
  provider: ChannelProvider;
  name: string;
  status: ChannelConnectionStatus;
  credentials: ChannelCredentials;
  config: ChannelConfig;
  metadata: Record<string, unknown>;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  webhookSecret?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  botToken?: string;
  pageId?: string;
  [key: string]: string | undefined;
}

export interface ChannelConfig {
  welcomeMessage?: string;
  autoReply?: boolean;
  aiEnabled?: boolean;
  businessHoursOnly?: boolean;
  tags?: string[];
}

// ─── Inbound Message from Channel ───

export interface InboundChannelMessage {
  channelProvider: ChannelProvider;
  channelConnectionId: string;
  externalContactId: string;
  externalMessageId: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAvatar?: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' | 'interactive';
  text?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  location?: { lat: number; lng: number };
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// ─── Outbound Message to Channel ───

export interface OutboundChannelMessage {
  channelProvider: ChannelProvider;
  channelConnectionId: string;
  externalContactId: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'template';
  text?: string;
  mediaUrl?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface ChannelWebhookPayload {
  provider: ChannelProvider;
  rawPayload: unknown;
  headers: Record<string, string>;
  timestamp: Date;
}
