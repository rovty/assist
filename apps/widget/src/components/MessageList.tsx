import { useEffect, useRef } from 'preact/hooks';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  primaryColor: string;
}

export function MessageList({ messages, isTyping, primaryColor }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isTyping]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {messages.length === 0 && !isTyping && (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '40px' }}>
          👋 Hi there! How can we help you today?
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} primaryColor={primaryColor} />
      ))}

      {isTyping && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', animation: 'pulse 1.5s infinite' }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', animation: 'pulse 1.5s infinite 0.3s' }} />
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', animation: 'pulse 1.5s infinite 0.6s' }} />
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
