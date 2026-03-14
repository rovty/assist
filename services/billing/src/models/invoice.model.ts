import mongoose, { Schema, type Document } from 'mongoose';

export interface IInvoice extends Document {
  tenantId: string;
  stripeInvoiceId: string;
  subscriptionId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  periodStart: Date;
  periodEnd: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    tenantId: { type: String, required: true, index: true },
    stripeInvoiceId: { type: String, required: true, unique: true },
    subscriptionId: { type: String, required: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'usd' },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'open', 'paid', 'void', 'uncollectible'],
      default: 'draft',
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    hostedInvoiceUrl: { type: String },
    invoicePdf: { type: String },
  },
  { timestamps: true },
);

invoiceSchema.index({ tenantId: 1, createdAt: -1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
