// ─── Media Types ───

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export enum MediaStorage {
  LOCAL = 'local',
  AZURE_BLOB = 'azure_blob',
  S3 = 's3',
}

export interface MediaFile {
  id: string;
  tenantId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  storage: MediaStorage;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
  uploadedBy: string;
  createdAt: Date;
}

export interface UploadResult {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  type: MediaType;
}

export interface MediaQuota {
  usedBytes: number;
  limitBytes: number;
  usedPercent: number;
  fileCount: number;
}

export const ALLOWED_MIME_TYPES: Record<MediaType, string[]> = {
  [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  [MediaType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
  [MediaType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  [MediaType.DOCUMENT]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/json',
  ],
  [MediaType.OTHER]: [],
};

export const MAX_FILE_SIZES: Record<MediaType, number> = {
  [MediaType.IMAGE]: 10 * 1024 * 1024,     // 10 MB
  [MediaType.VIDEO]: 100 * 1024 * 1024,    // 100 MB
  [MediaType.AUDIO]: 50 * 1024 * 1024,     // 50 MB
  [MediaType.DOCUMENT]: 25 * 1024 * 1024,  // 25 MB
  [MediaType.OTHER]: 10 * 1024 * 1024,     // 10 MB
};
