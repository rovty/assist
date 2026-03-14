import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('chunker-service');

export interface TextChunk {
  content: string;
  position: number;
  tokenCount: number;
  metadata?: {
    pageTitle?: string;
    url?: string;
    section?: string;
  };
}

/**
 * Split text into overlapping chunks suitable for embedding.
 * Uses a simple sentence-aware splitting strategy.
 */
export function chunkText(
  text: string,
  opts?: {
    chunkSize?: number;
    chunkOverlap?: number;
    metadata?: Record<string, string>;
  },
): TextChunk[] {
  const chunkSize = opts?.chunkSize ?? env.KB_CHUNK_SIZE;
  const chunkOverlap = opts?.chunkOverlap ?? env.KB_CHUNK_OVERLAP;

  // Clean and normalize text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();

  if (!cleaned) return [];

  // Split by sentences/paragraphs
  const sentences = cleaned.split(/(?<=[.!?])\s+|\n\n/);
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let position = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // Estimate tokens (~4 chars per token)
    const estimatedTokens = Math.ceil((currentChunk.length + trimmed.length) / 4);

    if (estimatedTokens > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        position,
        tokenCount: Math.ceil(currentChunk.trim().length / 4),
        metadata: opts?.metadata as TextChunk['metadata'],
      });
      position++;

      // Keep overlap
      const words = currentChunk.trim().split(/\s+/);
      const overlapWords = Math.ceil(chunkOverlap / 4);
      currentChunk = words.slice(-overlapWords).join(' ') + ' ' + trimmed;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmed;
    }
  }

  // Final chunk
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      position,
      tokenCount: Math.ceil(currentChunk.trim().length / 4),
      metadata: opts?.metadata as TextChunk['metadata'],
    });
  }

  logger.debug({ chunkCount: chunks.length, totalChars: cleaned.length }, 'Text chunked');
  return chunks;
}

/**
 * Parse FAQ content into chunks (one chunk per Q&A pair).
 */
export function chunkFAQ(
  faqs: Array<{ question: string; answer: string }>,
): TextChunk[] {
  return faqs.map((faq, index) => ({
    content: `Q: ${faq.question}\nA: ${faq.answer}`,
    position: index,
    tokenCount: Math.ceil((faq.question.length + faq.answer.length + 6) / 4),
    metadata: { section: 'FAQ' },
  }));
}

/**
 * Extract text from a URL page (simple HTML stripping).
 */
export async function fetchAndExtractText(url: string): Promise<{ text: string; title?: string }> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'AssistBot/1.0 (+https://assist.rovty.com)' },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Use cheerio for HTML parsing
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);

    // Remove script/style/nav
    $('script, style, nav, footer, header, aside, [role="navigation"]').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    return { text, title };
  } catch (err) {
    logger.error({ err, url }, 'Failed to fetch URL');
    throw err;
  }
}
