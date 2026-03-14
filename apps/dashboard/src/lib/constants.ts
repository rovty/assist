export const APP_NAME = 'Assist';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000';

export const CONVERSATION_STATUS = {
  OPEN: 'open',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const LEAD_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'] as const;

export const AGENT_STATUS = {
  ONLINE: 'online',
  AWAY: 'away',
  OFFLINE: 'offline',
} as const;
