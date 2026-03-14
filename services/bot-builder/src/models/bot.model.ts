import mongoose, { Schema, type Document } from 'mongoose';

export type BotNodeType =
  | 'trigger'
  | 'message'
  | 'condition'
  | 'action'
  | 'ai_response'
  | 'handoff'
  | 'delay'
  | 'collect_input'
  | 'api_call'
  | 'set_variable';

export interface IBotNode {
  nodeId: string;
  type: BotNodeType;
  label: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface IBotEdge {
  edgeId: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface IBot extends Document {
  tenantId: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  trigger: string;
  nodes: IBotNode[];
  edges: IBotEdge[];
  variables: Record<string, string>;
  currentVersion: number;
  publishedVersion?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const botNodeSchema = new Schema<IBotNode>(
  {
    nodeId: { type: String, required: true },
    type: {
      type: String,
      enum: ['trigger', 'message', 'condition', 'action', 'ai_response', 'handoff', 'delay', 'collect_input', 'api_call', 'set_variable'],
      required: true,
    },
    label: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const botEdgeSchema = new Schema<IBotEdge>(
  {
    edgeId: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    condition: { type: String },
    label: { type: String },
  },
  { _id: false },
);

const botSchema = new Schema<IBot>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    trigger: { type: String, required: true, default: 'on_message' },
    nodes: [botNodeSchema],
    edges: [botEdgeSchema],
    variables: { type: Schema.Types.Mixed, default: {} },
    currentVersion: { type: Number, default: 1 },
    publishedVersion: { type: Number },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'bots',
  },
);

botSchema.index({ tenantId: 1, status: 1 });
botSchema.index({ tenantId: 1, createdAt: -1 });

export const Bot = mongoose.model<IBot>('Bot', botSchema);
