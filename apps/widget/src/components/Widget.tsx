import { useEffect, useState } from 'preact/hooks';
import type { AssistConfig, WidgetState } from '../types';
import { getState, subscribe } from '../store';
import { Launcher } from './Launcher';
import { ChatWindow } from './ChatWindow';

interface WidgetProps {
  config: AssistConfig;
}

export function Widget({ config }: WidgetProps) {
  const [state, setState] = useState<WidgetState>(getState);

  useEffect(() => subscribe(() => setState(getState())), []);

  const pos = config.theme?.position ?? 'right';
  const offsetX = config.theme?.offsetX ?? 20;
  const offsetY = config.theme?.offsetY ?? 20;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${offsetY}px`,
        [pos]: `${offsetX}px`,
        zIndex: 2147483647,
        fontFamily: config.theme?.fontFamily ?? 'system-ui, -apple-system, sans-serif',
      }}
    >
      {state.isOpen && <ChatWindow config={config} state={state} />}
      <Launcher
        isOpen={state.isOpen}
        unreadCount={state.unreadCount}
        primaryColor={config.theme?.primaryColor ?? '#6366f1'}
      />
    </div>
  );
}
