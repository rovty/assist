'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@assist/ui';

export function FlowEditor() {
  return (
    <Card className="h-[600px]">
      <CardHeader>
        <CardTitle>Flow Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Visual flow editor (React Flow integration) — coming soon
        </p>
      </CardContent>
    </Card>
  );
}
