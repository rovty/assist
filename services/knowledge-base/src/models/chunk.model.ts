import mongoose, { Schema, type Document } from 'mongoose';

export interface IKBChunk extends Document {
  sourceId: string;
  tenantId: string;
  content: string;
  embedding: number[];
  metadata: {
    pageTitle?: string;
    url?: string;
    section?: string;
    position: number;
    tokenCount: number;
  };
  createdAt: Date;
}

const kbChunkSchema = new Schema<IKBChunk>(
  {
    sourceId: { type: String, required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: {
      pageTitle: { type: String },
      url: { type: String },
      section: { type: String },
      position: { type: Number, required: true },
      tokenCount: { type: Number, required: true },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'kb_chunks',
  },
);

kbChunkSchema.index({ tenantId: 1, sourceId: 1 });
kbChunkSchema.index({ tenantId: 1, createdAt: -1 });

export const KBChunk = mongoose.model<IKBChunk>('KBChunk', kbChunkSchema);
