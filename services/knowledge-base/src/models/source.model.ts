import mongoose, { Schema, type Document } from 'mongoose';

export interface IKBSource extends Document {
  tenantId: string;
  type: 'url' | 'file' | 'text' | 'sitemap' | 'faq';
  name: string;
  url?: string;
  fileId?: string;
  content?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed' | 'stale';
  errorMessage?: string;
  chunkCount: number;
  metadata: Record<string, unknown>;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const kbSourceSchema = new Schema<IKBSource>(
  {
    tenantId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['url', 'file', 'text', 'sitemap', 'faq'],
      required: true,
    },
    name: { type: String, required: true },
    url: { type: String },
    fileId: { type: String },
    content: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'failed', 'stale'],
      default: 'pending',
    },
    errorMessage: { type: String },
    chunkCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastSyncedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'kb_sources',
  },
);

kbSourceSchema.index({ tenantId: 1, status: 1 });
kbSourceSchema.index({ tenantId: 1, type: 1 });
kbSourceSchema.index({ tenantId: 1, createdAt: -1 });

export const KBSource = mongoose.model<IKBSource>('KBSource', kbSourceSchema);
