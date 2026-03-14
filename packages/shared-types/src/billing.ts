// ─── Billing Types ───

export enum PlanId {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
}

export interface PlanDefinition {
  id: string;
  name: string;
  monthlyPrice: number;
  seats: number;
  features: string[];
}

export interface Subscription {
  tenantId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
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

export interface InvoiceRecord {
  id: string;
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

export interface UsageRecord {
  metric: string;
  total: number;
  period: string;
}

export interface UsageLimit {
  allowed: boolean;
  current: number;
  limit: number;
}
