'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@assist/ui';
import { MessageSquare, Bot, Users, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

const statCards = [
  { title: 'Open Conversations', icon: MessageSquare, key: 'openConversations' as const },
  { title: 'Active Bots', icon: Bot, key: 'activeBots' as const },
  { title: 'Total Leads', icon: Users, key: 'totalLeads' as const },
  { title: 'Resolution Rate', icon: TrendingUp, key: 'resolutionRate' as const },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useAnalytics();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '—' : (stats?.[card.key] ?? 0)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
