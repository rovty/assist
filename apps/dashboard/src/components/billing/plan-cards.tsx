'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from '@assist/ui';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For small teams getting started',
    features: ['Up to 3 agents', '1,000 conversations/mo', 'Email channel', 'Basic analytics'],
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For growing teams',
    features: ['Up to 10 agents', '10,000 conversations/mo', 'All channels', 'Advanced analytics', 'Bot builder', 'Knowledge base'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited agents', 'Unlimited conversations', 'All channels', 'Custom analytics', 'Priority support', 'SSO & SAML', 'Dedicated success manager'],
  },
];

export function PlanCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={plan.popular ? 'border-2 border-primary ring-1 ring-primary/20' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              {plan.popular && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  Popular
                </span>
              )}
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              {plan.price}
              {plan.price !== 'Custom' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
              {plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
