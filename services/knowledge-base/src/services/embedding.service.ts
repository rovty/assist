import OpenAI from 'openai';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('embedding-service');

class EmbeddingService {
  private client: OpenAI | null = null;
  private model: string;
  private isAzure: boolean;
  private isMock: boolean;

  constructor() {
    this.isAzure = !!(env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY);

    if (this.isAzure) {
      this.client = new OpenAI({
        apiKey: env.AZURE_OPENAI_API_KEY,
        baseURL: `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
        defaultQuery: { 'api-version': env.AZURE_OPENAI_API_VERSION },
        defaultHeaders: { 'api-key': env.AZURE_OPENAI_API_KEY },
      });
      this.model = env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
      this.isMock = false;
      logger.info({ model: this.model }, 'Using Azure OpenAI embeddings');
    } else if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      this.model = env.OPENAI_EMBEDDING_MODEL;
      this.isMock = false;
      logger.info({ model: this.model }, 'Using OpenAI embeddings');
    } else {
      this.model = 'mock';
      this.isMock = true;
      logger.warn('No embedding API configured — running in mock mode');
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (this.isMock || !this.client) {
      return texts.map(() => this.mockEmbedding());
    }

    try {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (err) {
      logger.error({ err }, 'Embedding generation failed');
      // Return mock embeddings as fallback instead of crashing
      return texts.map(() => this.mockEmbedding());
    }
  }

  async embedSingle(text: string): Promise<number[]> {
    const [embedding] = await this.embed([text]);
    return embedding!;
  }

  private mockEmbedding(dimensions = 256): number[] {
    // Deterministic-ish mock embedding for dev/test
    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.sin(i * 0.1) * 0.5);
    }
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return embedding.map((v) => v / magnitude);
  }

  getStatus() {
    return {
      provider: this.isAzure ? 'azure-openai' : this.isMock ? 'mock' : 'openai',
      model: this.model,
      configured: !this.isMock,
    };
  }
}

export const embeddingService = new EmbeddingService();
