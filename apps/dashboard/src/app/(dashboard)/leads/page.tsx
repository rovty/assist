'use client';

import { Button } from '@assist/ui';
import { Plus } from 'lucide-react';
import { PipelineBoard } from '@/components/leads/pipeline-board';

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage your leads pipeline and contacts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <PipelineBoard />
    </div>
  );
}
