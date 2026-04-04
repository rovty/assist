'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@assist/ui';
import { Plus } from 'lucide-react';

import { AccessDeniedState } from '@/components/auth/access-denied-state';
import { BotList } from '@/components/bots/bot-list';
import { useAuthorization } from '@/hooks/use-authorization';

export default function BotsPage() {
  const { can } = useAuthorization();

  if (!can('bots:view')) {
    return (
      <AccessDeniedState
        title="Bot access is restricted"
        description="Your role does not include access to the bot workspace. Ask an owner or admin if you need bot visibility."
      />
    );
  }

  const canManageBots = can('bots:manage');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bots</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage automated bot flows</p>
        </div>
        {canManageBots ? (
          <Button>
            <Plus className="h-4 w-4 shrink-0" />
            Create Bot
          </Button>
        ) : (
          <Badge variant="outline">Read-only</Badge>
        )}
      </div>

      <BotList canManage={canManageBots} />
    </div>
  );
}
