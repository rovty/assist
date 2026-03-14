// ─── Agent Workspace Types ───

export enum AgentStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum QueuePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum RoutingStrategy {
  ROUND_ROBIN = 'round-robin',
  LEAST_BUSY = 'least-busy',
  SKILL_BASED = 'skill-based',
  MANUAL = 'manual',
}

export interface AgentState {
  agentId: string;
  tenantId: string;
  status: AgentStatus;
  maxConcurrent: number;
  activeCount: number;
  skills: string[];
  lastStatusChange: string;
}

export interface QueueItem {
  id: string;
  tenantId: string;
  conversationId: string;
  channel: string;
  priority: QueuePriority;
  skills: string[];
  metadata: Record<string, unknown>;
  status: 'waiting' | 'assigned' | 'resolved';
  assignedTo?: string;
  enqueuedAt: string;
  assignedAt?: string;
}

export interface RoutingConfig {
  strategy: RoutingStrategy;
  autoAssign: boolean;
  maxQueueWaitMs?: number;
}

export interface CannedResponse {
  id: string;
  tenantId: string;
  shortcut: string;
  title: string;
  content: string;
  category?: string;
  isGlobal: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentStats {
  total: number;
  byStatus: Record<string, number>;
  totalActive: number;
  totalCapacity: number;
}
