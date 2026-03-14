'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@assist/ui';
import { Plus, Bot } from 'lucide-react';
import { BotList } from '@/components/bots/bot-list';

export default function BotsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bots</h1>
          <p className="text-muted-foreground">Create and manage automated bot flows</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Bot
        </Button>
      </div>

      <BotList />
    </div>
  );
}
