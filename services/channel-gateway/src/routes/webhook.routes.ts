import type { FastifyInstance } from 'fastify';
import { createLogger } from '@assist/shared-utils';
import {
  verifyWhatsAppWebhook,
  verifyMessengerWebhook,
  verifyWhatsAppSignature,
  processInboundMessage,
} from '../services/channel.service.js';

const logger = createLogger('webhook-routes');

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  // ─── WhatsApp Webhook Verification ───
  app.get('/whatsapp', async (request, reply) => {
    const query = request.query as Record<string, string>;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const result = verifyWhatsAppWebhook(mode, token, challenge);
    if (result) {
      logger.info('WhatsApp webhook verified');
      reply.code(200).send(result);
    } else {
      reply.code(403).send('Verification failed');
    }
  });

  // ─── WhatsApp Inbound Messages ───
  app.post('/whatsapp', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string;
    const rawBody = JSON.stringify(request.body);

    if (!verifyWhatsAppSignature(rawBody, signature ?? '')) {
      reply.code(401).send('Invalid signature');
      return;
    }

    const body = request.body as WhatsAppWebhookPayload;

    // Process each message entry
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        for (const message of value.messages ?? []) {
          const contact = value.contacts?.find((c: { wa_id: string }) => c.wa_id === message.from);

          await processInboundMessage({
            provider: 'whatsapp',
            externalContactId: message.from,
            contactName: contact?.profile?.name,
            contactPhone: message.from,
            messageType: message.type,
            text: message.text?.body,
            mediaUrl: undefined, // Would need to download from WhatsApp
            metadata: { messageId: message.id, timestamp: message.timestamp },
          });
        }
      }
    }

    reply.code(200).send('OK');
  });

  // ─── Messenger Webhook Verification ───
  app.get('/messenger', async (request, reply) => {
    const query = request.query as Record<string, string>;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const result = verifyMessengerWebhook(mode, token, challenge);
    if (result) {
      logger.info('Messenger webhook verified');
      reply.code(200).send(result);
    } else {
      reply.code(403).send('Verification failed');
    }
  });

  // ─── Messenger Inbound Messages ───
  app.post('/messenger', async (request, reply) => {
    const body = request.body as MessengerWebhookPayload;

    for (const entry of body.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        if (!event.message) continue;

        await processInboundMessage({
          provider: 'messenger',
          externalContactId: event.sender.id,
          messageType: event.message.attachments ? 'image' : 'text',
          text: event.message.text,
          mediaUrl: event.message.attachments?.[0]?.payload?.url,
          metadata: { messageId: event.message.mid },
        });
      }
    }

    reply.code(200).send('EVENT_RECEIVED');
  });

  // ─── Telegram Webhook ───
  app.post('/telegram', async (request, reply) => {
    const body = request.body as TelegramUpdate;

    if (body.message) {
      const msg = body.message;

      await processInboundMessage({
        provider: 'telegram',
        externalContactId: msg.chat.id.toString(),
        contactName: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || undefined,
        messageType: msg.text ? 'text' : msg.photo ? 'image' : msg.document ? 'file' : 'text',
        text: msg.text ?? msg.caption,
        metadata: { messageId: msg.message_id, chatType: msg.chat.type },
      });
    }

    reply.code(200).send('OK');
  });
}

// ─── Payload Types ───

interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: {
        messaging_product: string;
        contacts?: Array<{ wa_id: string; profile: { name: string } }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }>;
      };
    }>;
  }>;
}

interface MessengerWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    messaging: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        attachments?: Array<{
          type: string;
          payload: { url: string };
        }>;
      };
    }>;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name: string; last_name?: string };
    chat: { id: number; type: string };
    date: number;
    text?: string;
    caption?: string;
    photo?: unknown[];
    document?: unknown;
  };
}
