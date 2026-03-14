import mongoose, { Schema, type Document } from 'mongoose';

export interface ISubscription extends Document {
  tenantId: string;
  planId: string;
  planName: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  seats: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'],
      default: 'trialing',
    },
    stripeCustomerId: { type: String, required: true, index: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEnd: { type: Date },
    seats: { type: Number, required: true, default: 1 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
