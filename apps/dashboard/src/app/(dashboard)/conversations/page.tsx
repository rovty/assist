'use client';

import { useState } from 'react';

import { AccessDeniedState } from '@/components/auth/access-denied-state';
import { ConversationDetail } from '@/components/conversations/conversation-detail';
import { ConversationList } from '@/components/conversations/conversation-list';
import { useAuthorization } from '@/hooks/use-authorization';

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { can } = useAuthorization();

  if (!can('conversations:view')) {
    return (
      <AccessDeniedState
        title="Conversation access is restricted"
        description="Your current role cannot open the inbox. Ask an owner or admin if you need customer conversation access."
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="w-80 shrink-0">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <div className="flex-1">
        {selectedId ? (
          <ConversationDetail conversationId={selectedId} canReply={can('conversations:reply')} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a conversation to view
          </div>
        )}
      </div>
    </div>
  );
}
