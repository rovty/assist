'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@assist/ui';
import { Plus, Search, FileText, Globe, Upload } from 'lucide-react';

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
          <p className="text-muted-foreground">Manage AI knowledge sources for bot responses</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
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
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader className="flex flex-row items-center gap-3">
              {source.type === 'web' ? (
                <Globe className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <CardTitle className="text-base">{source.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{source.documents} documents</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className={source.status === 'synced' ? 'text-green-600' : 'text-amber-600'}>
                  {source.status === 'synced' ? '● Synced' : '● Syncing…'}
                </span>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
