import { createLogger } from '@assist/shared-utils';
import { KBSource, type IKBSource } from '../models/source.model.js';
import { KBChunk, type IKBChunk } from '../models/chunk.model.js';
import { embeddingService } from './embedding.service.js';
import { chunkText, chunkFAQ, fetchAndExtractText } from './chunker.service.js';
import { redis } from '../utils/redis.js';
import { env } from '../env.js';
import type { CreateSourceInput, SearchKBInput } from '../schemas/kb.schema.js';

const logger = createLogger('kb-service');

// ─── Source Management ───

export async function createSource(
  tenantId: string,
  input: CreateSourceInput,
): Promise<IKBSource> {
  // Check source limit
  const count = await KBSource.countDocuments({ tenantId });
  if (count >= env.KB_MAX_SOURCES_PER_TENANT) {
    throw new Error(`Maximum ${env.KB_MAX_SOURCES_PER_TENANT} sources per tenant`);
  }

  const source = await KBSource.create({
    tenantId,
    type: input.type,
    name: input.name,
    url: input.url,
    fileId: input.fileId,
    content: input.content,
    status: 'pending',
    metadata: input.metadata ?? {},
  });

  // Trigger async processing
  processSource(source).catch((err) => {
    logger.error({ err, sourceId: source.id }, 'Background source processing failed');
  });

  return source;
}

export async function getSources(
  tenantId: string,
  opts: { page: number; pageSize: number; type?: string; status?: string },
) {
  const filter: Record<string, unknown> = { tenantId };
  if (opts.type) filter.type = opts.type;
  if (opts.status) filter.status = opts.status;

  const [sources, total] = await Promise.all([
    KBSource.find(filter)
      .sort({ createdAt: -1 })
      .skip((opts.page - 1) * opts.pageSize)
      .limit(opts.pageSize)
      .lean(),
    KBSource.countDocuments(filter),
  ]);

  return {
    data: sources,
    pagination: {
      page: opts.page,
      pageSize: opts.pageSize,
      total,
      totalPages: Math.ceil(total / opts.pageSize),
    },
  };
}

export async function getSource(tenantId: string, sourceId: string) {
  return KBSource.findOne({ _id: sourceId, tenantId }).lean();
}

export async function deleteSource(tenantId: string, sourceId: string): Promise<boolean> {
  const source = await KBSource.findOneAndDelete({ _id: sourceId, tenantId });
  if (!source) return false;

  // Delete all chunks for this source
  await KBChunk.deleteMany({ sourceId, tenantId });

  // Invalidate cache
  await redis.del(`kb:search-cache:${tenantId}`);

  logger.info({ sourceId, tenantId }, 'Source and chunks deleted');
  return true;
}

export async function reprocessSource(tenantId: string, sourceId: string): Promise<IKBSource | null> {
  const source = await KBSource.findOne({ _id: sourceId, tenantId });
  if (!source) return null;

  source.status = 'pending';
  source.errorMessage = undefined;
  await source.save();

  processSource(source).catch((err) => {
    logger.error({ err, sourceId }, 'Reprocessing failed');
  });

  return source;
}

// ─── Search ───

export async function searchKnowledgeBase(
  tenantId: string,
  input: SearchKBInput,
) {
  const topK = input.topK ?? env.KB_SEARCH_TOP_K;
  const minScore = input.minScore ?? env.KB_SEARCH_MIN_SCORE;

  // Generate query embedding
  const queryEmbedding = await embeddingService.embedSingle(input.query);

  // Get all chunks for this tenant (or specific sources)
  const filter: Record<string, unknown> = { tenantId };
  if (input.sourceIds?.length) {
    filter.sourceId = { $in: input.sourceIds };
  }

  const chunks = await KBChunk.find(filter).lean();

  if (chunks.length === 0) {
    return { results: [], query: input.query, totalChunks: 0 };
  }

  // Compute cosine similarity
  const scored = chunks
    .map((chunk) => ({
      chunkId: chunk._id.toString(),
      sourceId: chunk.sourceId,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
      metadata: chunk.metadata,
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  logger.info(
    { tenantId, query: input.query.substring(0, 50), results: scored.length },
    'KB search completed',
  );

  return {
    results: scored,
    query: input.query,
    totalChunks: chunks.length,
  };
}

// ─── Stats ───

export async function getKBStats(tenantId: string) {
  const [totalSources, readySources, failedSources, totalChunks] = await Promise.all([
    KBSource.countDocuments({ tenantId }),
    KBSource.countDocuments({ tenantId, status: 'ready' }),
    KBSource.countDocuments({ tenantId, status: 'failed' }),
    KBChunk.countDocuments({ tenantId }),
  ]);

  const lastUpdated = await KBSource.findOne({ tenantId })
    .sort({ updatedAt: -1 })
    .select('updatedAt')
    .lean();

  return {
    totalSources,
    readySources,
    failedSources,
    totalChunks,
    lastUpdated: lastUpdated?.updatedAt,
  };
}

// ─── Processing Pipeline ───

async function processSource(source: IKBSource): Promise<void> {
  logger.info({ sourceId: source.id, type: source.type }, 'Processing source');

  try {
    await KBSource.updateOne({ _id: source.id }, { status: 'processing' });

    // Delete existing chunks
    await KBChunk.deleteMany({ sourceId: source.id, tenantId: source.tenantId });

    let textChunks;

    switch (source.type) {
      case 'url': {
        const { text, title } = await fetchAndExtractText(source.url!);
        textChunks = chunkText(text, {
          metadata: { pageTitle: title, url: source.url },
        });
        break;
      }

      case 'text': {
        textChunks = chunkText(source.content!);
        break;
      }

      case 'faq': {
        const faqs = JSON.parse(source.content!) as Array<{ question: string; answer: string }>;
        textChunks = chunkFAQ(faqs);
        break;
      }

      case 'file': {
        // Download file from media service and extract text
        const text = await fetchFileContent(source.fileId!);
        textChunks = chunkText(text, {
          metadata: { pageTitle: source.name },
        });
        break;
      }

      case 'sitemap': {
        // For sitemap, fetch and extract the sitemap URLs, then process each
        const text = await fetchSitemapContent(source.url!);
        textChunks = chunkText(text, {
          metadata: { url: source.url },
        });
        break;
      }

      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }

    if (textChunks.length === 0) {
      throw new Error('No content extracted from source');
    }

    // Generate embeddings in batches
    const batchSize = 20;
    const allChunkDocs: Array<{
      sourceId: string;
      tenantId: string;
      content: string;
      embedding: number[];
      metadata: typeof textChunks[0]['metadata'] & { position: number; tokenCount: number };
    }> = [];

    for (let i = 0; i < textChunks.length; i += batchSize) {
      const batch = textChunks.slice(i, i + batchSize);
      const contents = batch.map((c) => c.content);
      const embeddings = await embeddingService.embed(contents);

      for (let j = 0; j < batch.length; j++) {
        allChunkDocs.push({
          sourceId: source.id,
          tenantId: source.tenantId,
          content: batch[j]!.content,
          embedding: embeddings[j]!,
          metadata: {
            ...batch[j]!.metadata,
            position: batch[j]!.position,
            tokenCount: batch[j]!.tokenCount,
          },
        });
      }
    }

    // Bulk insert chunks
    await KBChunk.insertMany(allChunkDocs);

    // Update source status
    await KBSource.updateOne(
      { _id: source.id },
      {
        status: 'ready',
        chunkCount: allChunkDocs.length,
        lastSyncedAt: new Date(),
        errorMessage: null,
      },
    );

    // Invalidate search cache
    await redis.del(`kb:search-cache:${source.tenantId}`);

    logger.info(
      { sourceId: source.id, chunkCount: allChunkDocs.length },
      'Source processed successfully',
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ err, sourceId: source.id }, 'Source processing failed');

    await KBSource.updateOne(
      { _id: source.id },
      { status: 'failed', errorMessage: message },
    );
  }
}

// ─── Helpers ───

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

async function fetchFileContent(fileId: string): Promise<string> {
  try {
    const response = await fetch(`${env.MEDIA_SERVICE_URL}/media/${fileId}/content`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/pdf')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const pdfParse = (await import('pdf-parse')).default;
      const pdf = await pdfParse(buffer);
      return pdf.text;
    }

    return await response.text();
  } catch (err) {
    logger.error({ err, fileId }, 'Failed to fetch file content');
    throw new Error(`Could not extract content from file ${fileId}`);
  }
}

async function fetchSitemapContent(sitemapUrl: string): Promise<string> {
  try {
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'AssistBot/1.0' },
      signal: AbortSignal.timeout(30000),
    });

    const xml = await response.text();
    const cheerio = await import('cheerio');

    // Parse sitemap XML for URLs
    const $ = cheerio.load(xml, { xmlMode: true });
    const urls = $('loc')
      .map((_i, el) => $(el).text())
      .get()
      .slice(0, 50); // Limit to 50 pages

    logger.info({ urlCount: urls.length }, 'Sitemap URLs extracted');

    // Fetch each URL and concatenate content
    const results: string[] = [];
    for (const url of urls) {
      try {
        const { text, title } = await fetchAndExtractText(url);
        results.push(`# ${title ?? url}\n\n${text}`);
      } catch {
        logger.warn({ url }, 'Failed to fetch sitemap URL, skipping');
      }
    }

    return results.join('\n\n---\n\n');
  } catch (err) {
    logger.error({ err, sitemapUrl }, 'Failed to process sitemap');
    throw err;
  }
}
