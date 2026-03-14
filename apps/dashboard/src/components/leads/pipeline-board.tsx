'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from '@assist/ui';
import { useLeads } from '@/hooks/use-leads';

const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'] as const;

const stageColors: Record<string, string> = {
  New: 'bg-blue-50 border-blue-200 dark:bg-blue-950',
  Contacted: 'bg-amber-50 border-amber-200 dark:bg-amber-950',
  Qualified: 'bg-purple-50 border-purple-200 dark:bg-purple-950',
  Proposal: 'bg-orange-50 border-orange-200 dark:bg-orange-950',
  Won: 'bg-green-50 border-green-200 dark:bg-green-950',
};

export function PipelineBoard() {
  const { data: leads, isLoading } = useLeads();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageLeads = leads?.filter((l) => l.stage === stage) ?? [];
        return (
          <div key={stage} className="w-72 shrink-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{stage}</h3>
              <Badge variant="secondary">{stageLeads.length}</Badge>
            </div>
            <div className={`space-y-2 rounded-lg border p-2 ${stageColors[stage] ?? ''}`}>
              {isLoading ? (
                <p className="p-2 text-xs text-muted-foreground">Loading…</p>
              ) : stageLeads.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">No leads</p>
              ) : (
                stageLeads.map((lead) => (
                  <Card key={lead.id} className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3">
                      <Avatar name={lead.name} size="sm" />
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{lead.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                      {lead.score && (
                        <Badge variant="outline" className="shrink-0">{lead.score}</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
