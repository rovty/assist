// ─── Lead/CRM Types ───

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

export enum LeadActivityType {
  NOTE = 'note',
  EMAIL = 'email',
  CALL = 'call',
  MEETING = 'meeting',
  TASK = 'task',
  STAGE_CHANGE = 'stage_change',
  SCORE_CHANGE = 'score_change',
}

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  source?: string;
  status: LeadStatus;
  score: number;
  tags: string[];
  pipelineId?: string;
  stageId?: string;
  assignedTo?: string;
  conversationId?: string;
  contactId?: string;
  customFields: Record<string, unknown>;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  stageId: string;
  name: string;
  order: number;
  color?: string;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  tenantId: string;
  type: LeadActivityType;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  performedBy: string;
  createdAt: Date;
}
