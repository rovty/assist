'use client';

const usageItems = [
  { label: 'Conversations', used: 3241, limit: 10000 },
  { label: 'Agents', used: 5, limit: 10 },
  { label: 'Bot flows', used: 8, limit: 25 },
  { label: 'KB Sources', used: 3, limit: 10 },
];

export function UsageMeter() {
  return (
    <div className="space-y-4">
      {usageItems.map((item) => {
        const pct = Math.round((item.used / item.limit) * 100);
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground">
                {item.used.toLocaleString()} / {item.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-destructive' : 'bg-primary'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
