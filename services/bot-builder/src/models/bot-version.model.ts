import mongoose, { Schema, type Document } from 'mongoose';
import type { IBotNode, IBotEdge } from './bot.model.js';

export interface IBotVersion extends Document {
  tenantId: string;
  botId: string;
  version: number;
  nodes: IBotNode[];
  edges: IBotEdge[];
  variables: Record<string, string>;
  createdBy: string;
  createdAt: Date;
}

const botVersionSchema = new Schema<IBotVersion>(
  {
    tenantId: { type: String, required: true, index: true },
    botId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    nodes: { type: Schema.Types.Mixed, default: [] },
    edges: { type: Schema.Types.Mixed, default: [] },
    variables: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'bot_versions',
  },
);

botVersionSchema.index({ botId: 1, version: -1 }, { unique: true });

export const BotVersion = mongoose.model<IBotVersion>('BotVersion', botVersionSchema);
