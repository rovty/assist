'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@assist/ui';
import { Bot, MoreVertical } from 'lucide-react';
import { useBots } from '@/hooks/use-bots';

const statusColors: Record<string, 'success' | 'secondary' | 'warning'> = {
  published: 'success',
  draft: 'secondary',
  paused: 'warning',
};

export function BotList({ canManage = false }: { canManage?: boolean }) {
  const { data: bots, isLoading } = useBots();

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading bots…</div>;
  }

  if (!bots?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12">
          <Bot className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No bots created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => (
        <Card key={bot.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{bot.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{bot.triggerCount} triggers</p>
              </div>
            </div>
            <Badge variant={statusColors[bot.status] ?? 'secondary'}>{bot.status}</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{bot.conversations} conversations</span>
              <Button variant="ghost" size="sm">{canManage ? 'Edit' : 'View'}</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
