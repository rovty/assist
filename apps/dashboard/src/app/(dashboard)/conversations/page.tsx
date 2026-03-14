'use client';

import { ConversationList } from '@/components/conversations/conversation-list';
import { ConversationDetail } from '@/components/conversations/conversation-detail';
import { useState } from 'react';

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 shrink-0">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="flex-1">
        {selectedId ? (
          <ConversationDetail conversationId={selectedId} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a conversation to view
          </div>
        )}
      </div>
    </div>
  );
}
