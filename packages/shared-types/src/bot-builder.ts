// ─── Bot Builder Types ───

export enum BotStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum BotNodeType {
  START = 'start',
  MESSAGE = 'message',
  QUESTION = 'question',
  CONDITION = 'condition',
  DELAY = 'delay',
  API_CALL = 'api_call',
  AI_RESPONSE = 'ai_response',
  ASSIGN_AGENT = 'assign_agent',
  SET_VARIABLE = 'set_variable',
  END = 'end',
}

export interface BotNode {
  id: string;
  type: BotNodeType;
  label: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface BotEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface Bot {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: BotStatus;
  trigger: {
    type: string;
    conditions: Record<string, unknown>;
  };
  nodes: BotNode[];
  edges: BotEdge[];
  variables: Record<string, unknown>;
  currentVersion: number;
  publishedVersion?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BotVersion {
  id: string;
  botId: string;
  tenantId: string;
  version: number;
  nodes: BotNode[];
  edges: BotEdge[];
  variables: Record<string, unknown>;
  publishedBy: string;
  publishedAt: Date;
}

export interface SimulationResult {
  steps: SimulationStep[];
  finalVariables: Record<string, unknown>;
  completed: boolean;
}

export interface SimulationStep {
  nodeId: string;
  nodeType: string;
  label: string;
  output?: string;
}
