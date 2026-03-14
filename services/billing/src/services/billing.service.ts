import { createLogger, NotFoundError } from '@assist/shared-utils';
import { Subscription } from '../models/subscription.model.js';
import { Invoice } from '../models/invoice.model.js';
import {
  createCustomer,
  createCheckoutSession,
  cancelSubscription as stripeCancelSubscription,
  PLANS,
} from './stripe.service.js';
import type {
  CreateCheckoutInput,
  UpdateSubscriptionInput,
  CancelSubscriptionInput,
} from '../schemas/billing.schema.js';

const logger = createLogger('billing:service');

/* ─── Subscription ─────────────────────────────────────────── */

export async function getSubscription(tenantId: string) {
  const sub = await Subscription.findOne({ tenantId });
  if (!sub) {
    // Return free plan as default
    return {
      tenantId,
      planId: 'free',
      planName: 'Free',
      status: 'active' as const,
      seats: 1,
      features: PLANS.free.features,
    };
  }
  return sub;
}

export async function createOrGetCustomer(tenantId: string, email: string, name?: string) {
  const existing = await Subscription.findOne({ tenantId });
  if (existing) return existing.stripeCustomerId;

  const customer = await createCustomer(tenantId, email, name);
  return customer.id;
}

export async function initiateCheckout(
  tenantId: string,
  userId: string,
  email: string,
  input: CreateCheckoutInput,
) {
  const plan = PLANS[input.planId];
  if (!plan) throw new NotFoundError('Plan not found');

  const customerId = await createOrGetCustomer(tenantId, email);

  const session = await createCheckoutSession(
    customerId,
    input.planId,
    input.seats,
    input.successUrl,
    input.cancelUrl,
  );

  logger.info({ tenantId, planId: input.planId, sessionId: session.id }, 'Checkout session created');

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function updateSubscription(tenantId: string, input: UpdateSubscriptionInput) {
  const sub = await Subscription.findOne({ tenantId });
  if (!sub) throw new NotFoundError('No active subscription found');

  if (input.planId) {
    sub.planId = input.planId;
    sub.planName = PLANS[input.planId]?.name ?? input.planId;
  }
  if (input.seats !== undefined) {
    sub.seats = input.seats;
  }

  await sub.save();
  logger.info({ tenantId, planId: sub.planId, seats: sub.seats }, 'Subscription updated');
  return sub;
}

export async function cancelSubscription(tenantId: string, input: CancelSubscriptionInput) {
  const sub = await Subscription.findOne({ tenantId });
  if (!sub || !sub.stripeSubscriptionId) {
    throw new NotFoundError('No active subscription found');
  }

  await stripeCancelSubscription(sub.stripeSubscriptionId, input.cancelAtPeriodEnd);

  sub.cancelAtPeriodEnd = input.cancelAtPeriodEnd;
  if (!input.cancelAtPeriodEnd) {
    sub.status = 'canceled';
  }
  await sub.save();

  logger.info({ tenantId, cancelAtPeriodEnd: input.cancelAtPeriodEnd }, 'Subscription canceled');
  return sub;
}

/* ─── Invoices ─────────────────────────────────────────────── */

export async function listInvoices(tenantId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Invoice.find({ tenantId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Invoice.countDocuments({ tenantId }),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

/* ─── Plans ────────────────────────────────────────────────── */

export function listPlans() {
  return Object.values(PLANS);
}
