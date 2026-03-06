import type { FastifyInstance } from 'fastify';
import { success } from '@assist/shared-utils';
import { aiService } from '../services/ai.service.js';
import {
  chatSchema,
  summarizeSchema,
  sentimentSchema,
  suggestReplySchema,
  classifySchema,
} from '../schemas/ai.schema.js';
import { extractTenantContext } from '../middleware/auth.js';

export async function aiRoutes(app: FastifyInstance) {
  app.addHook('preHandler', extractTenantContext);

  // ─── Chat (generate AI response) ───
  app.post('/chat', async (request, reply) => {
    const body = chatSchema.parse(request.body);
    const result = await aiService.chat(request.tenantId!, body);
    return reply.send(success(result));
  });

  // ─── Summarize conversation ───
  app.post('/summarize', async (request, reply) => {
    const body = summarizeSchema.parse(request.body);
    const result = await aiService.summarize(request.tenantId!, body);
    return reply.send(success(result));
  });

  // ─── Sentiment analysis ───
  app.post('/sentiment', async (request, reply) => {
    const body = sentimentSchema.parse(request.body);
    const result = await aiService.analyzeSentiment(request.tenantId!, body);
    return reply.send(success(result));
  });

  // ─── Suggest replies for agents ───
  app.post('/suggest-reply', async (request, reply) => {
    const body = suggestReplySchema.parse(request.body);
    const result = await aiService.suggestReplies(request.tenantId!, body);
    return reply.send(success(result));
  });

  // ─── Classify intent ───
  app.post('/classify', async (request, reply) => {
    const body = classifySchema.parse(request.body);
    const result = await aiService.classifyIntent(request.tenantId!, body);
    return reply.send(success(result));
  });

  // ─── AI Status ───
  app.get('/status', async (_request, reply) => {
    const status = aiService.getStatus();
    return reply.send(success(status));
  });
}
