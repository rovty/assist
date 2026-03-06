import OpenAI from 'openai';
import { createLogger, BadRequestError } from '@assist/shared-utils';
import { env } from '../env.js';
import { redis } from '../utils/redis.js';
import { promptService } from './prompt.service.js';
import type {
  ChatInput,
  SummarizeInput,
  SentimentInput,
  SuggestReplyInput,
  ClassifyInput,
} from '../schemas/ai.schema.js';

const logger = createLogger('ai-service');

export class AiService {
  private client: OpenAI;
  private model: string;
  private isAzure: boolean;

  constructor() {
    // Prefer Azure OpenAI if configured, else fallback to OpenAI
    this.isAzure = !!(env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY);

    if (this.isAzure) {
      this.client = new OpenAI({
        apiKey: env.AZURE_OPENAI_API_KEY,
        baseURL: `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${env.AZURE_OPENAI_DEPLOYMENT}`,
        defaultQuery: { 'api-version': env.AZURE_OPENAI_API_VERSION },
        defaultHeaders: { 'api-key': env.AZURE_OPENAI_API_KEY },
      });
      this.model = env.AZURE_OPENAI_DEPLOYMENT;
      logger.info({ endpoint: env.AZURE_OPENAI_ENDPOINT, deployment: this.model }, 'Using Azure OpenAI');
    } else if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      this.model = env.OPENAI_MODEL;
      logger.info({ model: this.model }, 'Using OpenAI API');
    } else {
      // Mock mode — no API key configured
      this.client = null as unknown as OpenAI;
      this.model = 'mock';
      logger.warn('No AI API key configured — running in mock mode');
    }
  }

  async chat(tenantId: string, input: ChatInput) {
    const startTime = Date.now();

    const systemPrompt = promptService.getSystemPrompt(input.systemPrompt);
    const messages = promptService.buildMessages(systemPrompt, input.messages, input.userMessage);

    if (this.model === 'mock') {
      return this.mockChatResponse(input, startTime);
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: input.maxTokens ?? env.AI_MAX_TOKENS,
        temperature: input.temperature ?? env.AI_TEMPERATURE,
      });

      const choice = completion.choices[0];
      const responseText = choice?.message?.content ?? '';
      const usage = completion.usage;
      const responseTimeMs = Date.now() - startTime;

      // Estimate confidence based on finish reason and token usage
      const confidence = this.estimateConfidence(choice?.finish_reason ?? 'stop', responseText);

      // Cache the response for analytics
      await this.cacheResponse(tenantId, input.conversationId, {
        model: this.model,
        tokensUsed: usage?.total_tokens ?? 0,
        responseTimeMs,
        confidence,
      });

      logger.info({
        tenantId,
        conversationId: input.conversationId,
        model: this.model,
        tokens: usage?.total_tokens,
        responseTimeMs,
        confidence,
      }, 'AI chat response generated');

      return {
        response: responseText,
        confidence,
        model: completion.model ?? this.model,
        tokensUsed: {
          prompt: usage?.prompt_tokens ?? 0,
          completion: usage?.completion_tokens ?? 0,
          total: usage?.total_tokens ?? 0,
        },
        responseTimeMs,
        finishReason: choice?.finish_reason,
      };
    } catch (err) {
      logger.error({ err, tenantId, conversationId: input.conversationId }, 'AI chat error');
      // Fallback to mock in case of API errors
      return this.mockChatResponse(input, startTime);
    }
  }

  async summarize(tenantId: string, input: SummarizeInput) {
    const systemPrompt = promptService.getSummarizationPrompt();
    const conversationText = input.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    if (this.model === 'mock') {
      return {
        summary: 'This is a mock conversation summary. Configure an AI API key for real summaries.',
        topics: ['general inquiry'],
        sentiment: 'neutral' as const,
        resolved: false,
        actionItems: [],
        model: 'mock',
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
      logger.info({ tenantId, conversationId: input.conversationId }, 'Conversation summarized');
      return { ...result, model: this.model };
    } catch (err) {
      logger.error({ err, tenantId }, 'Summarization error');
      throw new BadRequestError('Failed to summarize conversation');
    }
  }

  async analyzeSentiment(tenantId: string, input: SentimentInput) {
    const systemPrompt = promptService.getSentimentPrompt();

    if (this.model === 'mock') {
      return {
        sentiment: 'neutral' as const,
        score: 0,
        emotions: ['neutral'],
        confidence: 0.8,
        model: 'mock',
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.text },
        ],
        max_tokens: 200,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
      logger.info({ tenantId, sentiment: result.sentiment }, 'Sentiment analyzed');
      return { ...result, model: this.model };
    } catch (err) {
      logger.error({ err, tenantId }, 'Sentiment analysis error');
      throw new BadRequestError('Failed to analyze sentiment');
    }
  }

  async suggestReplies(tenantId: string, input: SuggestReplyInput) {
    const systemPrompt = promptService.getSuggestReplyPrompt(input.count);
    const conversationText = input.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    if (this.model === 'mock') {
      return {
        suggestions: [
          { text: 'Thank you for reaching out! Let me help you with that.', tone: 'empathetic', confidence: 0.9 },
          { text: 'I\'d be happy to look into this for you. Could you provide more details?', tone: 'informative', confidence: 0.85 },
          { text: 'Let me escalate this to our team for a quicker resolution.', tone: 'action-oriented', confidence: 0.8 },
        ],
        model: 'mock',
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
      logger.info({ tenantId, count: result.suggestions?.length }, 'Reply suggestions generated');
      return { ...result, model: this.model };
    } catch (err) {
      logger.error({ err, tenantId }, 'Suggest replies error');
      throw new BadRequestError('Failed to generate reply suggestions');
    }
  }

  async classifyIntent(tenantId: string, input: ClassifyInput) {
    const systemPrompt = promptService.getClassifyPrompt(input.categories);

    if (this.model === 'mock') {
      return {
        intent: 'general_inquiry',
        confidence: 0.75,
        subIntent: 'information_request',
        urgency: 'medium' as const,
        model: 'mock',
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.text },
        ],
        max_tokens: 200,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
      logger.info({ tenantId, intent: result.intent }, 'Intent classified');
      return { ...result, model: this.model };
    } catch (err) {
      logger.error({ err, tenantId }, 'Classification error');
      throw new BadRequestError('Failed to classify intent');
    }
  }

  // ─── Helpers ───

  private estimateConfidence(finishReason: string, response: string): number {
    let confidence = 0.85;

    // Reduce confidence for truncated responses
    if (finishReason === 'length') confidence -= 0.15;

    // Reduce confidence for uncertain language
    const uncertainPhrases = [
      "i'm not sure",
      "i don't know",
      "i'm unable",
      "cannot help",
      "beyond my",
      "human agent",
      "escalate",
    ];
    const lowerResponse = response.toLowerCase();
    for (const phrase of uncertainPhrases) {
      if (lowerResponse.includes(phrase)) {
        confidence -= 0.1;
        break;
      }
    }

    // Boost confidence for structured, complete answers
    if (response.length > 50 && finishReason === 'stop') confidence += 0.05;

    return Math.max(0, Math.min(1, confidence));
  }

  private mockChatResponse(input: ChatInput, startTime: number) {
    const responseTimeMs = Date.now() - startTime;
    return {
      response: `Thank you for your message! I'm currently running in demo mode. Your message: "${input.userMessage.substring(0, 100)}..." — In production, this would be handled by Azure OpenAI GPT-4o.`,
      confidence: 0.75,
      intent: 'general_inquiry',
      model: 'mock',
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
      responseTimeMs,
      finishReason: 'stop',
    };
  }

  private async cacheResponse(
    tenantId: string,
    _conversationId: string,
    data: { model: string; tokensUsed: number; responseTimeMs: number; confidence: number },
  ) {
    try {
      const key = `ai:usage:${tenantId}:${new Date().toISOString().slice(0, 10)}`;
      await redis.hincrby(key, 'totalTokens', data.tokensUsed);
      await redis.hincrby(key, 'totalRequests', 1);
      await redis.expire(key, 86400 * 31); // 31 days TTL
    } catch {
      // Non-critical; ignore cache errors
    }
  }

  getStatus() {
    return {
      provider: this.isAzure ? 'azure-openai' : this.model === 'mock' ? 'mock' : 'openai',
      model: this.model,
      configured: this.model !== 'mock',
    };
  }
}

export const aiService = new AiService();
