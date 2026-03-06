import { createLogger, NotFoundError } from '@assist/shared-utils';
import { Conversation } from '../models/conversation.model.js';
import { Message } from '../models/message.model.js';
import { Contact } from '../models/contact.model.js';
import type {
  CreateConversationInput,
  SendMessageInput,
  UpdateConversationInput,
  ListConversationsInput,
  CreateContactInput,
} from '../schemas/conversation.schema.js';
import { env } from '../env.js';

const logger = createLogger('conversation-service');

export class ConversationService {
  // ─── Conversations ───

  async createConversation(tenantId: string, _userId: string, input: CreateConversationInput) {
    // Find or create contact
    let contactId = input.contactId;
    if (!contactId) {
      const contact = await Contact.create({
        tenantId,
        name: input.contactName ?? 'Anonymous',
        email: input.contactEmail,
        phone: input.contactPhone,
        channel: input.channel,
        metadata: input.metadata ?? {},
      });
      contactId = contact._id.toString();
    }

    // Create conversation
    const conversation = await Conversation.create({
      tenantId,
      contactId,
      channel: input.channel,
      status: 'new',
      subject: input.subject,
      metadata: input.metadata ?? {},
      messageCount: 1,
      lastMessageAt: new Date(),
    });

    // Create initial message
    const message = await Message.create({
      conversationId: conversation._id.toString(),
      tenantId,
      sender: { type: 'contact', id: contactId, name: input.contactName },
      content: { type: 'text', text: input.initialMessage },
    });

    // Try to get AI response
    await this.requestAiResponse(tenantId, conversation._id.toString(), input.initialMessage);

    logger.info({ tenantId, conversationId: conversation._id }, 'Conversation created');
    return { conversation, message, contactId };
  }

  async getConversation(tenantId: string, conversationId: string) {
    const conversation = await Conversation.findOne({ _id: conversationId, tenantId });
    if (!conversation) throw new NotFoundError('Conversation', conversationId);
    return conversation;
  }

  async listConversations(tenantId: string, input: ListConversationsInput) {
    const filter: Record<string, unknown> = { tenantId };
    if (input.status) filter['status'] = input.status;
    if (input.assignedAgentId) filter['assignedAgentId'] = input.assignedAgentId;
    if (input.channel) filter['channel'] = input.channel;

    const sortField = input.sortBy;
    const sortDir = input.sortOrder === 'asc' ? 1 : -1;

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((input.page - 1) * input.pageSize)
        .limit(input.pageSize)
        .lean(),
      Conversation.countDocuments(filter),
    ]);

    return {
      data: conversations,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        total,
        totalPages: Math.ceil(total / input.pageSize),
      },
    };
  }

  async updateConversation(tenantId: string, conversationId: string, input: UpdateConversationInput) {
    const update: Record<string, unknown> = {};
    if (input.status) {
      update['status'] = input.status;
      if (input.status === 'resolved') update['resolvedAt'] = new Date();
      if (input.status === 'closed') update['closedAt'] = new Date();
    }
    if (input.assignedAgentId !== undefined) update['assignedAgentId'] = input.assignedAgentId;
    if (input.priority) update['priority'] = input.priority;
    if (input.tags) update['tags'] = input.tags;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, tenantId },
      { $set: update },
      { new: true },
    );
    if (!conversation) throw new NotFoundError('Conversation', conversationId);

    logger.info({ tenantId, conversationId, update }, 'Conversation updated');
    return conversation;
  }

  async assignConversation(tenantId: string, conversationId: string, agentId: string) {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, tenantId },
      { $set: { assignedAgentId: agentId, status: 'assigned' } },
      { new: true },
    );
    if (!conversation) throw new NotFoundError('Conversation', conversationId);

    logger.info({ tenantId, conversationId, agentId }, 'Conversation assigned');
    return conversation;
  }

  // ─── Messages ───

  async sendMessage(tenantId: string, conversationId: string, userId: string, input: SendMessageInput) {
    const conversation = await Conversation.findOne({ _id: conversationId, tenantId });
    if (!conversation) throw new NotFoundError('Conversation', conversationId);

    const senderName = input.senderType === 'contact' ? undefined : 'Agent';
    const message = await Message.create({
      conversationId,
      tenantId,
      sender: { type: input.senderType, id: userId, name: senderName },
      content: input.content,
      replyToId: input.replyToId,
    });

    // Update conversation stats
    await Conversation.findByIdAndUpdate(conversationId, {
      $inc: { messageCount: 1 },
      $set: { lastMessageAt: new Date() },
    });

    // Track first response time
    if (input.senderType === 'agent' && !conversation.firstResponseAt) {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { firstResponseAt: new Date() },
      });
    }

    // If contact message, request AI response
    if (input.senderType === 'contact' && conversation.status !== 'assigned') {
      await this.requestAiResponse(tenantId, conversationId, input.content.text ?? '');
    }

    logger.info({ tenantId, conversationId, messageId: message._id }, 'Message sent');
    return message;
  }

  async getMessages(tenantId: string, conversationId: string, page = 1, pageSize = 50) {
    const conversation = await Conversation.findOne({ _id: conversationId, tenantId });
    if (!conversation) throw new NotFoundError('Conversation', conversationId);

    const [messages, total] = await Promise.all([
      Message.find({ conversationId, tenantId, isDeleted: false })
        .sort({ createdAt: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Message.countDocuments({ conversationId, tenantId, isDeleted: false }),
    ]);

    return {
      data: messages,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async markMessagesRead(tenantId: string, conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversationId,
        tenantId,
        'readBy.userId': { $ne: userId },
      },
      {
        $addToSet: { readBy: { userId, readAt: new Date() } },
      },
    );
    return { success: true };
  }

  // ─── Contacts ───

  async createContact(tenantId: string, input: CreateContactInput) {
    const contact = await Contact.create({
      tenantId,
      ...input,
      metadata: input.metadata ?? {},
      tags: input.tags ?? [],
    });
    logger.info({ tenantId, contactId: contact._id }, 'Contact created');
    return contact;
  }

  async getContact(tenantId: string, contactId: string) {
    const contact = await Contact.findOne({ _id: contactId, tenantId });
    if (!contact) throw new NotFoundError('Contact', contactId);
    return contact;
  }

  async listContacts(tenantId: string, page = 1, pageSize = 20) {
    const [contacts, total] = await Promise.all([
      Contact.find({ tenantId })
        .sort({ lastSeenAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Contact.countDocuments({ tenantId }),
    ]);

    return {
      data: contacts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getContactConversations(tenantId: string, contactId: string) {
    return Conversation.find({ tenantId, contactId }).sort({ updatedAt: -1 }).lean();
  }

  // ─── AI Integration ───

  private async requestAiResponse(tenantId: string, conversationId: string, userMessage: string) {
    try {
      // Get recent message history for context
      const recentMessages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const messages = recentMessages.reverse().map((m) => ({
        role: m.sender.type === 'contact' ? 'user' : 'assistant',
        content: m.content.text ?? '',
      }));

      // Call AI service
      const response = await fetch(`${env.AI_SERVICE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          conversationId,
          messages,
          userMessage,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        logger.warn({ tenantId, conversationId, status: response.status }, 'AI service returned error');
        return;
      }

      const aiResult = (await response.json()) as {
        data?: {
          response: string;
          confidence: number;
          intent?: string;
          model: string;
          tokensUsed: { prompt: number; completion: number; total: number };
          responseTimeMs: number;
        };
      };

      if (aiResult.data) {
        // Save AI response as a message
        const aiMessage = await Message.create({
          conversationId,
          tenantId,
          sender: { type: 'ai', id: 'ai-engine', name: 'AI Assistant' },
          content: { type: 'text', text: aiResult.data.response },
          aiMetadata: {
            model: aiResult.data.model,
            confidence: aiResult.data.confidence,
            intent: aiResult.data.intent,
            tokensUsed: aiResult.data.tokensUsed,
            responseTimeMs: aiResult.data.responseTimeMs,
          },
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          $inc: { messageCount: 1 },
          $set: {
            lastMessageAt: new Date(),
            status: 'ai_active',
            aiConfidence: aiResult.data.confidence,
          },
        });

        // Check if escalation needed (low confidence)
        if (aiResult.data.confidence < 0.5) {
          await Conversation.findByIdAndUpdate(conversationId, {
            $set: { status: 'queued' },
          });
          logger.info({ tenantId, conversationId, confidence: aiResult.data.confidence }, 'AI escalated to queue');
        }

        return aiMessage;
      }
    } catch (err) {
      // AI service might not be running — graceful degradation
      logger.warn({ err, tenantId, conversationId }, 'Failed to get AI response (service may be unavailable)');
    }
  }
}

export const conversationService = new ConversationService();
