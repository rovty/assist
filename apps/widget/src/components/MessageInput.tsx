import { useState } from 'preact/hooks';
import type { AssistConfig } from '../types';
import { addMessage } from '../store';

interface MessageInputProps {
  config: AssistConfig;
}

export function MessageInput({ config }: MessageInputProps) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    addMessage({
      id: crypto.randomUUID(),
      sender: 'contact',
      text: trimmed,
      timestamp: Date.now(),
    });

    setText('');
    // TODO: Send to API and handle response
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <input
        type="text"
        value={text}
        onInput={(e) => setText((e.target as HTMLInputElement).value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        style={{
          flex: 1,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          outline: 'none',
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: 'none',
          background: config.theme?.primaryColor ?? '#6366f1',
          color: '#fff',
          cursor: text.trim() ? 'pointer' : 'default',
          opacity: text.trim() ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
