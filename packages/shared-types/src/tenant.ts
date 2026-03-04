// ─── Tenant Types ───
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  planId: string;
  status: TenantStatus;
  settings: TenantSettings;
  usage: TenantUsage;
  createdAt: Date;
  updatedAt: Date;
}

export enum TenantStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export interface TenantSettings {
  branding: {
    logoUrl?: string;
    primaryColor: string;
    widgetPosition: 'bottom-right' | 'bottom-left';
    welcomeMessage: string;
    offlineMessage: string;
  };
  ai: {
    enabled: boolean;
    tone: 'formal' | 'friendly' | 'professional';
    confidenceThreshold: number; // 0-1, default 0.7
    maxTokensPerResponse: number;
    systemPrompt?: string;
  };
  notifications: {
    emailOnNewConversation: boolean;
    emailOnEscalation: boolean;
    pushEnabled: boolean;
  };
  widget: {
    enabled: boolean;
    allowedDomains: string[];
    preChatForm: boolean;
    preChatFields: PreChatField[];
    offlineFormEnabled: boolean;
  };
}

export interface PreChatField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select';
  required: boolean;
  options?: string[]; // for select type
}

export interface TenantUsage {
  aiMessages: number;
  aiMessagesLimit: number;
  contacts: number;
  contactsLimit: number;
  storageUsedMb: number;
  storageLimitMb: number;
  activeAgents: number;
  agentsLimit: number;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: import('./auth.js').UserRole;
  invitedBy: string;
  joinedAt: Date;
}

export enum PlanTier {
  STARTER = 'starter',
  GROWTH = 'growth',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  priceMonthly: number;
  priceYearly: number;
  limits: {
    aiMessagesPerMonth: number;
    contacts: number;
    channels: number;
    agents: number;
    storageMb: number;
  };
  features: string[];
}
