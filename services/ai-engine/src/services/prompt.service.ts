import { env } from '../env.js';

export class PromptService {
  getSystemPrompt(customPrompt?: string): string {
    if (customPrompt) return customPrompt;

    return `You are a helpful, friendly, and professional AI customer support assistant for a SaaS platform.

Your responsibilities:
- Answer customer questions accurately and concisely
- Help customers troubleshoot issues
- Guide customers through product features
- Escalate to a human agent when you cannot help or confidence is low
- Be polite, empathetic, and solution-oriented

Guidelines:
- Keep responses concise but thorough (2-4 sentences when possible)
- If you don't know the answer, say so honestly and offer to connect with a human agent
- Never make up information or provide incorrect technical details
- Use markdown formatting for code snippets or lists when helpful
- Maintain a ${env.AI_TEMPERATURE > 0.5 ? 'warm and conversational' : 'professional and precise'} tone`;
  }

  getSummarizationPrompt(): string {
    return `You are a conversation summarizer. Analyze the conversation and provide:
1. A brief summary (2-3 sentences)
2. Key topics discussed
3. Customer sentiment (positive/neutral/negative)
4. Whether the issue was resolved
5. Any action items

Respond in JSON format:
{
  "summary": "string",
  "topics": ["string"],
  "sentiment": "positive" | "neutral" | "negative",
  "resolved": boolean,
  "actionItems": ["string"]
}`;
  }

  getSentimentPrompt(): string {
    return `Analyze the sentiment of the following text. Respond with a JSON object:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": number (between -1.0 and 1.0, where -1 is very negative, 0 is neutral, 1 is very positive),
  "emotions": ["string"] (detected emotions like "frustrated", "happy", "confused", etc.),
  "confidence": number (between 0 and 1)
}`;
  }

  getSuggestReplyPrompt(count: number): string {
    return `Based on the conversation history, suggest ${count} possible reply options that a customer support agent could send. Each reply should be different in approach (e.g., one informative, one empathetic, one action-oriented).

Respond in JSON format:
{
  "suggestions": [
    {
      "text": "string",
      "tone": "informative" | "empathetic" | "action-oriented" | "apologetic",
      "confidence": number (0-1)
    }
  ]
}`;
  }

  getClassifyPrompt(categories?: string[]): string {
    const categoryList = categories?.length
      ? `Categories: ${categories.join(', ')}`
      : `Common categories: billing, technical_support, feature_request, bug_report, account, general_inquiry, cancellation, upgrade, integration, onboarding`;

    return `Classify the following customer message into an intent category.
${categoryList}

Respond in JSON format:
{
  "intent": "string",
  "confidence": number (0-1),
  "subIntent": "string" (optional, more specific classification),
  "urgency": "low" | "medium" | "high"
}`;
  }

  buildMessages(
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (limit to last 10 messages for context window)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      const role = msg.role === 'user' ? 'user' : 'assistant';
      messages.push({ role, content: msg.content });
    }

    // Add current user message if not already in history
    if (!recentHistory.some((m) => m.content === userMessage && m.role === 'user')) {
      messages.push({ role: 'user', content: userMessage });
    }

    return messages;
  }
}

export const promptService = new PromptService();
