import crypto from 'node:crypto';
import { createLogger, generateId } from '@assist/shared-utils';
import type { ChannelProvider } from '@assist/shared-types';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import type { ConnectChannelInput, UpdateChannelInput, SendOutboundInput } from '../schemas/channel.schema.js';

const logger = createLogger('channel-service');

const CHANNEL_KEY_PREFIX = 'channel:connection:';

export interface ChannelConnectionRecord {
  id: string;
  tenantId: string;
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  credentials: Record<string, string>;
  config: {
    welcomeMessage?: string;
    autoReply?: boolean;
    aiEnabled?: boolean;
    businessHoursOnly?: boolean;
    tags?: string[];
  };
  metadata: Record<string, unknown>;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Connection Management ───

export async function connectChannel(
  tenantId: string,
  input: ConnectChannelInput,
): Promise<ChannelConnectionRecord> {
  const id = generateId('ch');
  const now = new Date().toISOString();

  const connection: ChannelConnectionRecord = {
    id,
    tenantId,
    provider: input.provider,
    name: input.name,
    status: 'pending',
    credentials: input.credentials ?? {},
    config: input.config ?? { aiEnabled: true },
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };

  // Validate provider-specific credentials
  const validated = await validateProviderConfig(input.provider, connection.credentials);
  connection.status = validated ? 'connected' : 'pending';

  // Store connection
  await redis.hset(
    `${CHANNEL_KEY_PREFIX}${tenantId}`,
    id,
    JSON.stringify(connection),
  );

  logger.info({ connectionId: id, provider: input.provider, tenantId }, 'Channel connected');
  return connection;
}

export async function getConnections(tenantId: string): Promise<ChannelConnectionRecord[]> {
  const data = await redis.hgetall(`${CHANNEL_KEY_PREFIX}${tenantId}`);
  return Object.values(data)
    .map((v) => JSON.parse(v) as ChannelConnectionRecord)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getConnection(
  tenantId: string,
  connectionId: string,
): Promise<ChannelConnectionRecord | null> {
  const data = await redis.hget(`${CHANNEL_KEY_PREFIX}${tenantId}`, connectionId);
  return data ? (JSON.parse(data) as ChannelConnectionRecord) : null;
}

export async function updateConnection(
  tenantId: string,
  connectionId: string,
  input: UpdateChannelInput,
): Promise<ChannelConnectionRecord | null> {
  const existing = await getConnection(tenantId, connectionId);
  if (!existing) return null;

  const updated: ChannelConnectionRecord = {
    ...existing,
    name: input.name ?? existing.name,
    config: input.config ? { ...existing.config, ...input.config } : existing.config,
    updatedAt: new Date().toISOString(),
  };

  await redis.hset(
    `${CHANNEL_KEY_PREFIX}${tenantId}`,
    connectionId,
    JSON.stringify(updated),
  );

  return updated;
}

export async function disconnectChannel(
  tenantId: string,
  connectionId: string,
): Promise<boolean> {
  const existing = await getConnection(tenantId, connectionId);
  if (!existing) return false;

  existing.status = 'disconnected';
  existing.updatedAt = new Date().toISOString();

  await redis.hset(
    `${CHANNEL_KEY_PREFIX}${tenantId}`,
    connectionId,
    JSON.stringify(existing),
  );

  logger.info({ connectionId, tenantId }, 'Channel disconnected');
  return true;
}

export async function deleteConnection(
  tenantId: string,
  connectionId: string,
): Promise<boolean> {
  const removed = await redis.hdel(`${CHANNEL_KEY_PREFIX}${tenantId}`, connectionId);
  return removed > 0;
}

// ─── Inbound Message Processing ───

export async function processInboundMessage(payload: {
  provider: string;
  externalContactId: string;
  contactName?: string;
  contactPhone?: string;
  messageType: string;
  text?: string;
  mediaUrl?: string;
  metadata: Record<string, unknown>;
}): Promise<void> {
  logger.info(
    { provider: payload.provider, contactId: payload.externalContactId },
    'Processing inbound channel message',
  );

  // Find the tenant connection for this provider message
  // In production, this would use a lookup table mapping external IDs to tenants
  // For now, we log the message for processing

  // Forward to conversation service to create/update conversation
  try {
    await fetch(`${env.CONVERSATION_SERVICE_URL}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: payload.provider,
        contactName: payload.contactName ?? 'Unknown',
        contactEmail: '',
        contactExternalId: payload.externalContactId,
        contactPhone: payload.contactPhone,
        initialMessage: payload.text ?? '[Media message]',
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logger.error({ err, provider: payload.provider }, 'Failed to forward inbound message');
  }
}

// ─── Outbound Message Sending ───

export async function sendOutboundMessage(
  tenantId: string,
  input: SendOutboundInput,
): Promise<{ success: boolean; externalMessageId?: string; error?: string }> {
  const connection = await getConnection(tenantId, input.connectionId);
  if (!connection) {
    return { success: false, error: 'Connection not found' };
  }

  if (connection.status !== 'connected') {
    return { success: false, error: 'Channel is not connected' };
  }

  try {
    switch (connection.provider) {
      case 'whatsapp':
        return await sendWhatsAppMessage(connection, input);
      case 'telegram':
        return await sendTelegramMessage(connection, input);
      case 'messenger':
        return await sendMessengerMessage(connection, input);
      default:
        return { success: false, error: `Provider ${connection.provider} send not implemented` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ err, provider: connection.provider }, 'Outbound message failed');
    return { success: false, error: message };
  }
}

// ─── Provider-Specific Implementations ───

async function sendWhatsAppMessage(
  connection: ChannelConnectionRecord,
  input: SendOutboundInput,
): Promise<{ success: boolean; externalMessageId?: string; error?: string }> {
  const accessToken = connection.credentials.accessToken ?? env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = connection.credentials.phoneNumberId ?? env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp credentials not configured' };
  }

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: input.externalContactId,
  };

  if (input.messageType === 'text') {
    body.type = 'text';
    body.text = { body: input.text };
  } else if (input.messageType === 'template') {
    body.type = 'template';
    body.template = {
      name: input.templateId,
      language: { code: 'en' },
      components: input.templateParams
        ? [{ type: 'body', parameters: Object.values(input.templateParams).map((v) => ({ type: 'text', text: v })) }]
        : [],
    };
  } else if (['image', 'video', 'audio', 'file'].includes(input.messageType)) {
    body.type = input.messageType === 'file' ? 'document' : input.messageType;
    body[input.messageType === 'file' ? 'document' : input.messageType] = {
      link: input.mediaUrl,
    };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `WhatsApp API error: ${error}` };
    }

    const result = (await response.json()) as { messages?: Array<{ id: string }> };
    return {
      success: true,
      externalMessageId: result.messages?.[0]?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

async function sendTelegramMessage(
  connection: ChannelConnectionRecord,
  input: SendOutboundInput,
): Promise<{ success: boolean; externalMessageId?: string; error?: string }> {
  const botToken = connection.credentials.botToken ?? env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  try {
    let endpoint: string;
    let body: Record<string, unknown>;

    if (input.messageType === 'text') {
      endpoint = 'sendMessage';
      body = { chat_id: input.externalContactId, text: input.text };
    } else if (input.messageType === 'image') {
      endpoint = 'sendPhoto';
      body = { chat_id: input.externalContactId, photo: input.mediaUrl };
    } else if (input.messageType === 'video') {
      endpoint = 'sendVideo';
      body = { chat_id: input.externalContactId, video: input.mediaUrl };
    } else if (input.messageType === 'file') {
      endpoint = 'sendDocument';
      body = { chat_id: input.externalContactId, document: input.mediaUrl };
    } else {
      endpoint = 'sendMessage';
      body = { chat_id: input.externalContactId, text: input.text ?? '[Unsupported message type]' };
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Telegram API error: ${error}` };
    }

    const result = (await response.json()) as { result?: { message_id: number } };
    return {
      success: true,
      externalMessageId: result.result?.message_id?.toString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

async function sendMessengerMessage(
  connection: ChannelConnectionRecord,
  input: SendOutboundInput,
): Promise<{ success: boolean; externalMessageId?: string; error?: string }> {
  const pageAccessToken = connection.credentials.pageAccessToken ?? env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    return { success: false, error: 'Messenger page access token not configured' };
  }

  try {
    const body: Record<string, unknown> = {
      recipient: { id: input.externalContactId },
      message: {},
    };

    if (input.messageType === 'text') {
      body.message = { text: input.text };
    } else if (['image', 'video', 'audio', 'file'].includes(input.messageType)) {
      body.message = {
        attachment: {
          type: input.messageType === 'file' ? 'file' : input.messageType,
          payload: { url: input.mediaUrl, is_reusable: true },
        },
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Messenger API error: ${error}` };
    }

    const result = (await response.json()) as { message_id?: string };
    return {
      success: true,
      externalMessageId: result.message_id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ─── Helpers ───

async function validateProviderConfig(
  provider: string,
  credentials: Record<string, string>,
): Promise<boolean> {
  switch (provider) {
    case 'whatsapp':
      return !!(credentials.accessToken || env.WHATSAPP_ACCESS_TOKEN);
    case 'telegram':
      return !!(credentials.botToken || env.TELEGRAM_BOT_TOKEN);
    case 'messenger':
      return !!(credentials.pageAccessToken || env.MESSENGER_PAGE_ACCESS_TOKEN);
    default:
      // Other providers not yet validated
      return true;
  }
}

// ─── Webhook Verification ───

export function verifyWhatsAppWebhook(mode: string, token: string, challenge: string): string | null {
  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export function verifyMessengerWebhook(mode: string, token: string, challenge: string): string | null {
  if (mode === 'subscribe' && token === env.MESSENGER_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export function verifyWhatsAppSignature(payload: string, signature: string): boolean {
  if (!env.META_APP_SECRET) return true; // Skip in dev
  const expected = crypto
    .createHmac('sha256', env.META_APP_SECRET)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
