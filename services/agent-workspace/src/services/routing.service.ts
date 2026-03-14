import { createLogger } from '@assist/shared-utils';
import { getRedis } from '../utils/redis.js';
import type { UpdateAgentStatusInput, UpdateRoutingInput } from '../schemas/workspace.schema.js';

const logger = createLogger('agent-workspace:routing');

/* ─── Keys ─────────────────────────────────────────────────── */

function agentKey(tenantId: string, agentId: string) {
  return `workspace:agent:${tenantId}:${agentId}`;
}

function agentSetKey(tenantId: string) {
  return `workspace:agents:${tenantId}`;
}

function routingConfigKey(tenantId: string) {
  return `workspace:routing:${tenantId}`;
}

function roundRobinKey(tenantId: string) {
  return `workspace:rr_idx:${tenantId}`;
}

/* ─── Agent Status ─────────────────────────────────────────── */

export interface AgentState {
  agentId: string;
  tenantId: string;
  status: string;
  maxConcurrent: number;
  activeCount: number;
  skills: string[];
  lastStatusChange: string;
}

export async function updateAgentStatus(
  tenantId: string,
  agentId: string,
  input: UpdateAgentStatusInput,
): Promise<AgentState> {
  const redis = getRedis();
  const key = agentKey(tenantId, agentId);

  const existing = await redis.get(key);
  const current: Partial<AgentState> = existing ? JSON.parse(existing) : {};

  const state: AgentState = {
    agentId,
    tenantId,
    status: input.status,
    maxConcurrent: input.maxConcurrent ?? current.maxConcurrent ?? 5,
    activeCount: current.activeCount ?? 0,
    skills: input.skills ?? current.skills ?? [],
    lastStatusChange: new Date().toISOString(),
  };

  await redis.set(key, JSON.stringify(state));

  if (input.status === 'offline') {
    await redis.srem(agentSetKey(tenantId), agentId);
  } else {
    await redis.sadd(agentSetKey(tenantId), agentId);
  }

  logger.info({ tenantId, agentId, status: input.status }, 'Agent status updated');
  return state;
}

export async function getAgentStatus(tenantId: string, agentId: string): Promise<AgentState | null> {
  const redis = getRedis();
  const raw = await redis.get(agentKey(tenantId, agentId));
  return raw ? JSON.parse(raw) : null;
}

export async function listOnlineAgents(tenantId: string): Promise<AgentState[]> {
  const redis = getRedis();
  const agentIds = await redis.smembers(agentSetKey(tenantId));

  if (agentIds.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of agentIds) {
    pipeline.get(agentKey(tenantId, id));
  }
  const results = await pipeline.exec();

  const agents: AgentState[] = [];
  if (results) {
    for (const [err, raw] of results) {
      if (!err && raw) agents.push(JSON.parse(raw as string));
    }
  }

  return agents.filter((a) => a.status !== 'offline');
}

/* ─── Routing Config ───────────────────────────────────────── */

export interface RoutingConfig {
  strategy: string;
  autoAssign: boolean;
  maxQueueWaitMs?: number;
}

export async function getRoutingConfig(tenantId: string): Promise<RoutingConfig> {
  const redis = getRedis();
  const raw = await redis.get(routingConfigKey(tenantId));
  return raw
    ? JSON.parse(raw)
    : { strategy: 'round-robin', autoAssign: true };
}

export async function updateRoutingConfig(tenantId: string, input: UpdateRoutingInput): Promise<RoutingConfig> {
  const redis = getRedis();
  const config: RoutingConfig = {
    strategy: input.strategy,
    autoAssign: input.autoAssign,
    maxQueueWaitMs: input.maxQueueWaitMs,
  };
  await redis.set(routingConfigKey(tenantId), JSON.stringify(config));
  logger.info({ tenantId, strategy: config.strategy }, 'Routing config updated');
  return config;
}

/* ─── Route to next agent ──────────────────────────────────── */

export async function routeToAgent(
  tenantId: string,
  requiredSkills: string[] = [],
): Promise<string | null> {
  const config = await getRoutingConfig(tenantId);
  const agents = await listOnlineAgents(tenantId);

  // Filter to available agents (online/away with capacity)
  let available = agents.filter(
    (a) => (a.status === 'online' || a.status === 'away') && a.activeCount < a.maxConcurrent,
  );

  // Skill-based filtering
  if (requiredSkills.length > 0 && config.strategy === 'skill-based') {
    const skilled = available.filter((a) =>
      requiredSkills.every((s) => a.skills.includes(s)),
    );
    if (skilled.length > 0) available = skilled;
  }

  if (available.length === 0) return null;

  let selected: AgentState;

  switch (config.strategy) {
    case 'least-busy': {
      available.sort((a, b) => a.activeCount - b.activeCount);
      selected = available[0];
      break;
    }
    case 'round-robin': {
      const redis = getRedis();
      const idx = await redis.incr(roundRobinKey(tenantId));
      selected = available[idx % available.length];
      break;
    }
    case 'skill-based': {
      // Already filtered by skills, pick least-busy among them
      available.sort((a, b) => a.activeCount - b.activeCount);
      selected = available[0];
      break;
    }
    default: {
      // manual — no auto assign
      return null;
    }
  }

  // Increment active count
  const redis = getRedis();
  selected.activeCount += 1;
  await redis.set(agentKey(tenantId, selected.agentId), JSON.stringify(selected));

  logger.info({ tenantId, agentId: selected.agentId, strategy: config.strategy }, 'Routed to agent');
  return selected.agentId;
}

/* ─── Release assignment ───────────────────────────────────── */

export async function releaseAgentSlot(tenantId: string, agentId: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(agentKey(tenantId, agentId));
  if (!raw) return;

  const state: AgentState = JSON.parse(raw);
  state.activeCount = Math.max(0, state.activeCount - 1);
  await redis.set(agentKey(tenantId, agentId), JSON.stringify(state));
}

/* ─── Stats ────────────────────────────────────────────────── */

export async function getAgentStats(tenantId: string) {
  const agents = await listOnlineAgents(tenantId);
  const byStatus: Record<string, number> = {};

  for (const a of agents) {
    byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
  }

  return {
    total: agents.length,
    byStatus,
    totalActive: agents.reduce((sum, a) => sum + a.activeCount, 0),
    totalCapacity: agents.reduce((sum, a) => sum + a.maxConcurrent, 0),
  };
}
