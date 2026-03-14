export interface AssistConfig {
  workspaceId: string;
  apiUrl?: string;
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
    position?: 'left' | 'right';
    offsetX?: number;
    offsetY?: number;
  };
  preChatForm?: boolean;
  offlineForm?: boolean;
}

export interface Message {
  id: string;
  sender: 'contact' | 'agent' | 'bot';
  text: string;
  timestamp: number;
  attachments?: { url: string; name: string }[];
}

export interface WidgetState {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  unreadCount: number;
  contactInfo: { name: string; email: string } | null;
  isOnline: boolean;
}

declare global {
  interface Window {
    AssistConfig?: AssistConfig;
  }
}
