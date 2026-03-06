import mongoose, { Schema, type Document } from 'mongoose';

export interface IConversation extends Document {
  tenantId: string;
  contactId: string;
  channel: string;
  status: 'new' | 'ai_active' | 'queued' | 'assigned' | 'resolved' | 'closed';
  assignedAgentId?: string;
  teamId?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  aiConfidence?: number;
  sentimentScore?: number;
  metadata: Record<string, unknown>;
  messageCount: number;
  lastMessageAt?: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    tenantId: { type: String, required: true, index: true },
    contactId: { type: String, required: true, index: true },
    channel: { type: String, required: true, default: 'web' },
    status: {
      type: String,
      enum: ['new', 'ai_active', 'queued', 'assigned', 'resolved', 'closed'],
      default: 'new',
    },
    assignedAgentId: { type: String, sparse: true },
    teamId: { type: String },
    tags: [{ type: String }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    subject: { type: String },
    aiConfidence: { type: Number },
    sentimentScore: { type: Number },
    metadata: { type: Schema.Types.Mixed, default: {} },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
    firstResponseAt: { type: Date },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'conversations',
  },
);

// Compound indexes
conversationSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });
conversationSchema.index({ tenantId: 1, assignedAgentId: 1, status: 1 });
conversationSchema.index({ tenantId: 1, contactId: 1, createdAt: -1 });
conversationSchema.index({ tenantId: 1, channel: 1 });
conversationSchema.index({ tenantId: 1, tags: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
