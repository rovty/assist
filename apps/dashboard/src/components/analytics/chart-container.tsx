'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@assist/ui';

interface ChartContainerProps {
  title: string;
}

export function ChartContainer({ title }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">
          Chart visualization (Recharts integration) — coming soon
        </p>
      </CardContent>
    </Card>
  );
}
