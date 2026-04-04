'use client';

import { Badge, Button } from '@assist/ui';
import { Plus } from 'lucide-react';

import { AccessDeniedState } from '@/components/auth/access-denied-state';
import { useAuthorization } from '@/hooks/use-authorization';
import { PipelineBoard } from '@/components/leads/pipeline-board';

export default function LeadsPage() {
  const { can } = useAuthorization();

  if (!can('leads:view')) {
    return (
      <AccessDeniedState
        title="Lead access is restricted"
        description="Your role cannot open the leads pipeline. Ask an owner or admin if you should work with lead data."
      />
    );
  }

  const canManageLeads = can('leads:manage');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your leads pipeline and contacts</p>
        </div>
        {canManageLeads ? (
          <Button>
            <Plus className="h-4 w-4 shrink-0" />
            Add Lead
          </Button>
        ) : (
          <Badge variant="outline">Read-only</Badge>
        )}
      </div>

      <PipelineBoard readOnly={!canManageLeads} />
    </div>
  );
}
