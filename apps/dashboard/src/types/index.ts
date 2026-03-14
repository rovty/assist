export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  channel: string;
  assignedAgentId?: string;
  lastMessage: string;
  unread: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'contact' | 'agent' | 'bot';
  senderId: string;
  text: string;
  attachments?: { url: string; name: string; type: string }[];
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'paused';
  triggerCount: number;
  conversations: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  stage: string;
  score?: number;
  tags: string[];
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'viewer';
  status: 'online' | 'away' | 'offline';
  avatar?: string;
}

export interface AnalyticsOverview {
  openConversations: number;
  activeBots: number;
  totalLeads: number;
  resolutionRate: string;
  totalConversations: number;
  avgResponseTime: string;
  csatScore: string;
  activeAgents: number;
}
