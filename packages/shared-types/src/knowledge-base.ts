// ─── Knowledge Base Types ───

export enum KBSourceType {
  URL = 'url',
  FILE = 'file',
  TEXT = 'text',
  SITEMAP = 'sitemap',
  FAQ = 'faq',
}

export enum KBSourceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  STALE = 'stale',
}

export interface KBSource {
  id: string;
  tenantId: string;
  type: KBSourceType;
  name: string;
  url?: string;
  fileId?: string;
  content?: string;
  status: KBSourceStatus;
  errorMessage?: string;
  chunkCount: number;
  metadata: Record<string, unknown>;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KBChunk {
  id: string;
  sourceId: string;
  tenantId: string;
  content: string;
  embedding?: number[];
  metadata: {
    pageTitle?: string;
    url?: string;
    section?: string;
    position: number;
    tokenCount: number;
  };
  createdAt: Date;
}

export interface KBSearchResult {
  chunkId: string;
  sourceId: string;
  content: string;
  score: number;
  metadata: KBChunk['metadata'];
}

export interface KBSearchQuery {
  query: string;
  tenantId: string;
  topK?: number;
  minScore?: number;
  sourceIds?: string[];
}

export interface KBStats {
  totalSources: number;
  totalChunks: number;
  readySources: number;
  failedSources: number;
  lastUpdated?: Date;
}
