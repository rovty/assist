import mongoose, { Schema, type Document } from 'mongoose';

export interface IContact extends Document {
  tenantId: string;
  externalId?: string;
  email?: string;
  phone?: string;
  name: string;
  avatarUrl?: string;
  channel: string;
  metadata: Record<string, unknown>;
  tags: string[];
  leadScore: number;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    tenantId: { type: String, required: true, index: true },
    externalId: { type: String, sparse: true },
    email: { type: String, sparse: true },
    phone: { type: String, sparse: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    channel: { type: String, required: true, default: 'web' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    leadScore: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'contacts',
  },
);

// Compound indexes for multi-tenant queries
contactSchema.index({ tenantId: 1, email: 1 });
contactSchema.index({ tenantId: 1, externalId: 1 }, { unique: true, sparse: true });
contactSchema.index({ tenantId: 1, createdAt: -1 });
contactSchema.index({ tenantId: 1, tags: 1 });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
