'use client';

import { Badge, Avatar, Input, cn } from '@assist/ui';
import { Search } from 'lucide-react';
import { useConversations } from '@/hooks/use-conversations';

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading } = useConversations();

  return (
    <div className="flex h-full flex-col rounded-lg border bg-background">
      <div className="border-b p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search conversations…" className="pl-9" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !conversations?.length ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex w-full items-start gap-3 border-b p-3 text-left transition-colors hover:bg-muted/50',
                selectedId === conv.id && 'bg-muted',
              )}
            >
              <Avatar name={conv.contactName} size="sm" />
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{conv.contactName}</span>
                  <span className="text-xs text-muted-foreground">{conv.updatedAt}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <Badge variant="default" className="shrink-0">{conv.unread}</Badge>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
