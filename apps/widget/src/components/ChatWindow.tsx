import type { AssistConfig, WidgetState } from '../types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PreChatForm } from './PreChatForm';
import { OfflineForm } from './OfflineForm';

interface ChatWindowProps {
  config: AssistConfig;
  state: WidgetState;
}

export function ChatWindow({ config, state }: ChatWindowProps) {
  const primaryColor = config.theme?.primaryColor ?? '#6366f1';
  const showPreChat = config.preChatForm !== false && !state.contactInfo;
  const showOffline = !state.isOnline;

  return (
    <div
      style={{
        width: '370px',
        height: '520px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: primaryColor,
          color: '#fff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          A
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>Assist</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {state.isOnline ? 'We typically reply in a few minutes' : 'We are currently offline'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {showOffline ? (
          <OfflineForm config={config} />
        ) : showPreChat ? (
          <PreChatForm />
        ) : (
          <>
            <MessageList messages={state.messages} isTyping={state.isTyping} primaryColor={primaryColor} />
            <MessageInput config={config} />
          </>
        )}
      </div>
    </div>
  );
}
