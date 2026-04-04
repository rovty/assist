'use client';

import React from 'react';
import { useState } from 'react';
import { Button, Input } from '@assist/ui';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
  readOnly?: boolean;
}

export function MessageInput({ conversationId, readOnly = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  function handleSend() {
    if (readOnly || !message.trim()) return;
    // TODO: Send message via API
    setMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={readOnly}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder={readOnly ? 'Read-only access' : 'Type a message…'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          disabled={readOnly}
        />
        <Button size="icon" onClick={handleSend} disabled={readOnly || !message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {readOnly ? (
        <p className="text-xs text-muted-foreground">
          Your role can view conversations, but only owners, admins, and agents can reply.
        </p>
      ) : null}
      <span className="sr-only">{conversationId}</span>
    </div>
  );
}
