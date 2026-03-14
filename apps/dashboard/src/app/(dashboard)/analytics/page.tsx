'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@assist/ui';
import { OverviewCards } from '@/components/analytics/overview-cards';
import { ChartContainer } from '@/components/analytics/chart-container';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Track performance and conversation metrics</p>
      </div>

      <OverviewCards />

      <Tabs defaultValue="conversations">
        <TabsList>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="bots">Bots</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>
        <TabsContent value="conversations">
          <ChartContainer title="Conversation Volume" />
        </TabsContent>
        <TabsContent value="agents">
          <ChartContainer title="Agent Performance" />
        </TabsContent>
        <TabsContent value="bots">
          <ChartContainer title="Bot Engagement" />
        </TabsContent>
        <TabsContent value="satisfaction">
          <ChartContainer title="Customer Satisfaction (CSAT)" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
