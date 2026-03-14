'use client';

import { useState } from 'react';
import { Button, Input } from '@assist/ui';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');

  function handleSend() {
    if (!message.trim()) return;
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
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Input
        placeholder="Type a message…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
