'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@assist/ui';
import { useAnalytics } from '@/hooks/use-analytics';
import { MessageSquare, Clock, ThumbsUp, Users } from 'lucide-react';

const metrics = [
  { key: 'totalConversations' as const, label: 'Total Conversations', icon: MessageSquare },
  { key: 'avgResponseTime' as const, label: 'Avg Response Time', icon: Clock },
  { key: 'csatScore' as const, label: 'CSAT Score', icon: ThumbsUp },
  { key: 'activeAgents' as const, label: 'Active Agents', icon: Users },
];

export function OverviewCards() {
  const { data: stats, isLoading } = useAnalytics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{m.label}</CardTitle>
            <m.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : (stats?.[m.key] ?? '—')}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
