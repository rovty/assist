'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@assist/ui';
import { Plus, Search, FileText, Globe } from 'lucide-react';

const sources = [
  { id: '1', name: 'Help Center Articles', type: 'web', documents: 142, status: 'synced' },
  { id: '2', name: 'Product Documentation', type: 'file', documents: 86, status: 'synced' },
  { id: '3', name: 'FAQ Database', type: 'file', documents: 234, status: 'syncing' },
];

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage AI knowledge sources for bot responses</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 shrink-0" />
          Add Source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Knowledge Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Try a customer question…" className="flex-1" />
            <Button variant="secondary">
              <Search className="h-4 w-4 shrink-0" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card key={source.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                {source.type === 'web' ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{source.documents} documents</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={source.status === 'synced' ? 'success' : 'warning'} className="gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${source.status === 'synced' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {source.status === 'synced' ? 'Synced' : 'Syncing…'}
                </Badge>
                <Button variant="ghost" size="sm" className="text-xs">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
