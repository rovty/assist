'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from '@assist/ui';

import { AccessDeniedState } from '@/components/auth/access-denied-state';
import { PlanCards } from '@/components/billing/plan-cards';
import { UsageMeter } from '@/components/billing/usage-meter';
import { useAuthorization } from '@/hooks/use-authorization';

export default function BillingPage() {
  const { can } = useAuthorization();

  if (!can('billing:view')) {
    return (
      <AccessDeniedState
        title="Billing access is restricted"
        description="Only workspace owners can open billing and subscription controls."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription, plan, and usage</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant="secondary">Pro</Badge>
          </div>
          <CardDescription>Your trial ends in 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsageMeter />
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled={!can('billing:manage')}>Manage Subscription</Button>
        </CardFooter>
      </Card>

      <PlanCards />
    </div>
  );
}
