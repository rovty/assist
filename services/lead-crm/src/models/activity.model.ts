import mongoose, { Schema, type Document } from 'mongoose';

export type ActivityType = 'note' | 'email' | 'call' | 'meeting' | 'task' | 'stage_change' | 'score_change';

export interface IActivity extends Document {
  tenantId: string;
  leadId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  performedBy: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    tenantId: { type: String, required: true, index: true },
    leadId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['note', 'email', 'call', 'meeting', 'task', 'stage_change', 'score_change'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    performedBy: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'activities',
  },
);

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ tenantId: 1, type: 1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
