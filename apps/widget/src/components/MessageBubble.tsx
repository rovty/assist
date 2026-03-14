import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  primaryColor: string;
}

export function MessageBubble({ message, primaryColor }: MessageBubbleProps) {
  const isContact = message.sender === 'contact';

  return (
    <div style={{ display: 'flex', justifyContent: isContact ? 'flex-end' : 'flex-start' }}>
      <div
        style={{
          maxWidth: '75%',
          padding: '8px 12px',
          borderRadius: '12px',
          fontSize: '13px',
          lineHeight: '1.4',
          ...(isContact
            ? { background: primaryColor, color: '#fff', borderBottomRightRadius: '4px' }
            : { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: '4px' }),
        }}
      >
        <div>{message.text}</div>
        <div
          style={{
            fontSize: '10px',
            marginTop: '4px',
            opacity: 0.7,
            textAlign: 'right',
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
