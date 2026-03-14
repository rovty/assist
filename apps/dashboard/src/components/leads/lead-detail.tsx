'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, Button } from '@assist/ui';
import { Mail, Phone, Building2, Calendar } from 'lucide-react';

interface LeadDetailProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    stage: string;
    score?: number;
    createdAt: string;
  };
}

export function LeadDetail({ lead }: LeadDetailProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar name={lead.name} size="lg" />
        <div className="flex-1">
          <CardTitle>{lead.name}</CardTitle>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="secondary">{lead.stage}</Badge>
            {lead.score && <Badge variant="outline">Score: {lead.score}</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm">Edit</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{lead.email}</span>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{lead.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{lead.company}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Created {lead.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  );
}
