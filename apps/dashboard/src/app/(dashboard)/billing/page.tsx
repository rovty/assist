'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from '@assist/ui';
import { PlanCards } from '@/components/billing/plan-cards';
import { UsageMeter } from '@/components/billing/usage-meter';

export default function BillingPage() {
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
          <Button variant="outline">Manage Subscription</Button>
        </CardFooter>
      </Card>

      <PlanCards />
    </div>
  );
}
