export interface Conversation {
  id: string;
  contactName: string;
  contactEmail: string;
  lastMessage: string;
  unread: number;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  channel: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'contact' | 'agent' | 'bot';
  text: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  score?: number;
}

export type AgentStatus = 'online' | 'away' | 'offline';
