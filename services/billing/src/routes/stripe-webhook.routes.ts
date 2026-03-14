import { FastifyInstance } from 'fastify';
import { createLogger } from '@assist/shared-utils';
import { constructWebhookEvent } from '../services/stripe.service.js';
import { Subscription } from '../models/subscription.model.js';
import { Invoice } from '../models/invoice.model.js';
import type Stripe from 'stripe';

const logger = createLogger('billing:stripe-webhook');

export async function stripeWebhookRoutes(app: FastifyInstance) {
  // Register raw body content type parser for webhook signature verification
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.post('/', {
    handler: async (request, reply) => {
      const sig = request.headers['stripe-signature'] as string;
      if (!sig) return reply.status(400).send({ error: 'Missing stripe-signature header' });

      let event: Stripe.Event;
      try {
        event = constructWebhookEvent(request.body as Buffer, sig);
      } catch (err) {
        logger.warn({ err }, 'Webhook signature verification failed');
        return reply.status(400).send({ error: 'Invalid signature' });
      }

      logger.info({ type: event.type, id: event.id }, 'Stripe webhook received');

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutCompleted(session);
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(sub);
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(sub);
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaid(invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentFailed(invoice);
          break;
        }
        default:
          logger.debug({ type: event.type }, 'Unhandled webhook event');
      }

      return reply.send({ received: true });
    },
  });
}

/* ─── Event Handlers ───────────────────────────────────────── */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const planId = session.metadata?.planId ?? 'starter';

  // Find tenant by stripe customer ID
  let sub = await Subscription.findOne({ stripeCustomerId: customerId });

  if (sub) {
    sub.stripeSubscriptionId = subscriptionId;
    sub.status = 'active';
    sub.planId = planId;
    sub.currentPeriodStart = new Date();
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sub.save();
  } else {
    logger.warn({ customerId }, 'No subscription record found for checkout');
  }

  logger.info({ customerId, subscriptionId, planId }, 'Checkout completed');
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
  const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
  if (!sub) return;

  sub.status = stripeSub.status as typeof sub.status;
  sub.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
  sub.currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
  sub.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
  await sub.save();

  logger.info({ tenantId: sub.tenantId, status: sub.status }, 'Subscription updated via webhook');
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
  const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
  if (!sub) return;

  sub.status = 'canceled';
  await sub.save();

  logger.info({ tenantId: sub.tenantId }, 'Subscription canceled via webhook');
}

async function handleInvoicePaid(stripeInvoice: Stripe.Invoice) {
  const customerId = stripeInvoice.customer as string;
  const sub = await Subscription.findOne({ stripeCustomerId: customerId });
  if (!sub) return;

  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: stripeInvoice.id },
    {
      tenantId: sub.tenantId,
      stripeInvoiceId: stripeInvoice.id,
      subscriptionId: sub.stripeSubscriptionId ?? '',
      amountDue: stripeInvoice.amount_due,
      amountPaid: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status: 'paid',
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
      hostedInvoiceUrl: stripeInvoice.hosted_invoice_url ?? undefined,
      invoicePdf: stripeInvoice.invoice_pdf ?? undefined,
    },
    { upsert: true, new: true },
  );

  logger.info({ tenantId: sub.tenantId, invoiceId: stripeInvoice.id }, 'Invoice paid');
}

async function handleInvoicePaymentFailed(stripeInvoice: Stripe.Invoice) {
  const customerId = stripeInvoice.customer as string;
  const sub = await Subscription.findOne({ stripeCustomerId: customerId });
  if (!sub) return;

  sub.status = 'past_due';
  await sub.save();

  logger.warn({ tenantId: sub.tenantId, invoiceId: stripeInvoice.id }, 'Invoice payment failed');
}
