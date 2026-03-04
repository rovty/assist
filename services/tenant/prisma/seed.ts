import { PrismaClient } from '../src/generated/prisma/index.js';

// Seed script for Tenant Service
// Run: pnpm db:seed

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tenant service database...');

  // ─── Create Plans ───
  const plans = [
    {
      name: 'Starter',
      tier: 'starter',
      priceMonthly: 2900,  // $29
      priceYearly: 27800,  // $278 (20% off)
      aiMessagesPerMonth: 1000,
      contacts: 500,
      channels: 3,
      agents: 1,
      storageMb: 100,
      features: [
        'Web chat widget',
        'AI chatbot (GPT-4o-mini)',
        'Basic knowledge base',
        'Email notifications',
        'Basic analytics',
      ],
    },
    {
      name: 'Growth',
      tier: 'growth',
      priceMonthly: 7900,  // $79
      priceYearly: 75800,  // $758 (20% off)
      aiMessagesPerMonth: 5000,
      contacts: 2500,
      channels: 6,
      agents: 3,
      storageMb: 1024,
      features: [
        'Everything in Starter',
        'AI chatbot (GPT-4o)',
        'WhatsApp + Messenger',
        'Bot builder',
        'Lead scoring',
        'CRM integration',
        'Advanced analytics',
      ],
    },
    {
      name: 'Business',
      tier: 'business',
      priceMonthly: 19900, // $199
      priceYearly: 190800, // $1908 (20% off)
      aiMessagesPerMonth: 20000,
      contacts: 10000,
      channels: 10,
      agents: 10,
      storageMb: 10240,
      features: [
        'Everything in Growth',
        'All channels',
        'AI copilot for agents',
        'Custom bot flows',
        'A/B testing',
        'White-label branding',
        'Priority support',
        'Webhooks & API',
      ],
    },
    {
      name: 'Enterprise',
      tier: 'enterprise',
      priceMonthly: 0,     // Custom
      priceYearly: 0,      // Custom
      aiMessagesPerMonth: 999999,
      contacts: 999999,
      channels: 20,
      agents: 999,
      storageMb: 102400,
      features: [
        'Everything in Business',
        'Unlimited AI messages',
        'Unlimited contacts',
        'SSO (SAML/OIDC)',
        'Custom AI training',
        'Dedicated account manager',
        'SLA guarantee',
        'On-premise option',
        'Custom integrations',
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan: ${plan.name}`);
  }

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
