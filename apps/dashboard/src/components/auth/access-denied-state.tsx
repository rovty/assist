'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@assist/ui';

type AccessDeniedStateProps = {
  title: string;
  description: string;
};

export function AccessDeniedState({ title, description }: AccessDeniedStateProps) {
  return (
    <Card className="mx-auto max-w-2xl border-dashed">
      <CardHeader className="items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
