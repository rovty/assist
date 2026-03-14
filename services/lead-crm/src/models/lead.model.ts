import mongoose, { Schema, type Document } from 'mongoose';

export interface ILead extends Document {
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
  score: number;
  tags: string[];
  pipelineId?: string;
  stageId?: string;
  stageMovedAt?: Date;
  assignedTo?: string;
  conversationId?: string;
  contactId?: string;
  customFields: Record<string, unknown>;
  metadata: Record<string, unknown>;
  lastActivityAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    phone: { type: String },
    company: { type: String },
    title: { type: String },
    source: { type: String, required: true, default: 'web' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'],
      default: 'new',
    },
    score: { type: Number, default: 0 },
    tags: [{ type: String }],
    pipelineId: { type: String },
    stageId: { type: String },
    stageMovedAt: { type: Date },
    assignedTo: { type: String },
    conversationId: { type: String },
    contactId: { type: String },
    customFields: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastActivityAt: { type: Date },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'leads',
  },
);

leadSchema.index({ tenantId: 1, email: 1 }, { sparse: true });
leadSchema.index({ tenantId: 1, status: 1 });
leadSchema.index({ tenantId: 1, score: -1 });
leadSchema.index({ tenantId: 1, pipelineId: 1, stageId: 1 });
leadSchema.index({ tenantId: 1, assignedTo: 1 });
leadSchema.index({ tenantId: 1, createdAt: -1 });

export const Lead = mongoose.model<ILead>('Lead', leadSchema);
