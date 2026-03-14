'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@assist/ui';
import { OverviewCards } from '@/components/analytics/overview-cards';
import { ChartContainer } from '@/components/analytics/chart-container';
import { MessageSquare, Users, Bot, ThumbsUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track performance and conversation metrics</p>
      </div>

      <OverviewCards />

      <Tabs defaultValue="conversations">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="conversations" className="inline-flex items-center gap-2 px-4 py-2">
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>Conversations</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="inline-flex items-center gap-2 px-4 py-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger value="bots" className="inline-flex items-center gap-2 px-4 py-2">
            <Bot className="h-4 w-4 shrink-0" />
            <span>Bots</span>
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="inline-flex items-center gap-2 px-4 py-2">
            <ThumbsUp className="h-4 w-4 shrink-0" />
            <span>Satisfaction</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="conversations" className="mt-4">
          <ChartContainer title="Conversation Volume" />
        </TabsContent>
        <TabsContent value="agents" className="mt-4">
          <ChartContainer title="Agent Performance" />
        </TabsContent>
        <TabsContent value="bots" className="mt-4">
          <ChartContainer title="Bot Engagement" />
        </TabsContent>
        <TabsContent value="satisfaction" className="mt-4">
          <ChartContainer title="Customer Satisfaction (CSAT)" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
