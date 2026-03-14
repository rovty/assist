import Stripe from 'stripe';
import { createLogger } from '@assist/shared-utils';
import { env } from '../env.js';

const logger = createLogger('billing:stripe');

let stripe: Stripe;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
    logger.info('Stripe client initialized');
  }
  return stripe;
}

/* ─── Plans mapping ────────────────────────────────────────── */

export interface PlanDefinition {
  id: string;
  name: string;
  monthlyPrice: number; // cents
  seats: number;
  features: string[];
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    seats: 1,
    features: ['1 agent', '100 conversations/mo', 'Basic analytics'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 2900,
    seats: 5,
    features: ['5 agents', '1,000 conversations/mo', 'Bot builder', 'Email channel'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 7900,
    seats: 15,
    features: ['15 agents', '10,000 conversations/mo', 'All channels', 'AI engine', 'Knowledge base'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 19900,
    seats: 100,
    features: ['Unlimited agents', 'Unlimited conversations', 'Custom integrations', 'Dedicated support', 'SLA'],
  },
};

/* ─── Customer ─────────────────────────────────────────────── */

export async function createCustomer(tenantId: string, email: string, name?: string): Promise<Stripe.Customer> {
  const s = getStripe();
  return s.customers.create({
    email,
    name,
    metadata: { tenantId },
  });
}

/* ─── Checkout Session ─────────────────────────────────────── */

export async function createCheckoutSession(
  customerId: string,
  planId: string,
  seats: number,
  successUrl: string,
  cancelUrl: string,
): Promise<Stripe.Checkout.Session> {
  const s = getStripe();
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  if (plan.monthlyPrice === 0) {
    throw new Error('Cannot create checkout for free plan');
  }

  return s.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Assist ${plan.name} Plan` },
          unit_amount: plan.monthlyPrice,
          recurring: { interval: 'month' },
        },
        quantity: seats,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { planId },
  });
}

/* ─── Subscription Management ──────────────────────────────── */

export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const s = getStripe();
  return s.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
): Promise<Stripe.Subscription> {
  const s = getStripe();

  if (cancelAtPeriodEnd) {
    return s.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  return s.subscriptions.cancel(subscriptionId);
}

/* ─── Invoices ─────────────────────────────────────────────── */

export async function listStripeInvoices(
  customerId: string,
  limit = 20,
): Promise<Stripe.ApiList<Stripe.Invoice>> {
  const s = getStripe();
  return s.invoices.list({ customer: customerId, limit });
}

/* ─── Webhook verification ─────────────────────────────────── */

export function constructWebhookEvent(payload: Buffer, sig: string): Stripe.Event {
  const s = getStripe();
  return s.webhooks.constructEvent(payload, sig, env.STRIPE_WEBHOOK_SECRET);
}
