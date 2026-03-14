import { createLogger } from '@assist/shared-utils';
import { Bot } from '../models/bot.model.js';
import type { IBotNode, IBotEdge } from '../models/bot.model.js';

const logger = createLogger('bot-builder:simulator');

export interface SimulationStep {
  nodeId: string;
  type: string;
  label: string;
  output?: string;
  nextNodeId?: string;
}

export interface SimulationResult {
  botId: string;
  input: string;
  steps: SimulationStep[];
  finalOutput: string;
  completed: boolean;
}

export async function simulateBot(
  tenantId: string,
  botId: string,
  input: string,
  variables: Record<string, string> = {},
): Promise<SimulationResult | null> {
  const bot = await Bot.findOne({ _id: botId, tenantId }).lean();
  if (!bot) return null;

  const steps: SimulationStep[] = [];
  const vars = { ...bot.variables, ...variables, input };

  // Find the trigger node
  const triggerNode = bot.nodes.find((n) => n.type === 'trigger');
  if (!triggerNode) {
    return { botId, input, steps: [], finalOutput: 'No trigger node found', completed: false };
  }

  let currentNode: IBotNode | undefined = triggerNode;
  let finalOutput = '';
  const maxSteps = 50; // Safety limit
  let stepCount = 0;

  while (currentNode && stepCount < maxSteps) {
    stepCount++;
    const step: SimulationStep = {
      nodeId: currentNode.nodeId,
      type: currentNode.type,
      label: currentNode.label,
    };

    switch (currentNode.type) {
      case 'trigger':
        step.output = `Triggered by: ${input}`;
        break;

      case 'message': {
        const template = (currentNode.data.text as string) || '';
        step.output = interpolateVariables(template, vars);
        finalOutput = step.output;
        break;
      }

      case 'condition': {
        const field = currentNode.data.field as string;
        const operator = currentNode.data.operator as string;
        const value = currentNode.data.value as string;
        const actual = vars[field] || '';
        const matched = evaluateCondition(actual, operator, value);
        step.output = `${field} ${operator} ${value} → ${matched}`;
        break;
      }

      case 'collect_input':
        step.output = `Collecting: ${currentNode.data.question || 'input'}`;
        vars[(currentNode.data.variableName as string) || 'collected'] = input;
        break;

      case 'set_variable':
        vars[(currentNode.data.variableName as string) || 'var'] = (currentNode.data.value as string) || '';
        step.output = `Set ${currentNode.data.variableName} = ${currentNode.data.value}`;
        break;

      case 'delay':
        step.output = `Delay ${currentNode.data.seconds || 0}s`;
        break;

      case 'handoff':
        step.output = 'Handoff to human agent';
        steps.push(step);
        return { botId, input, steps, finalOutput: step.output, completed: true };

      case 'ai_response':
        step.output = '[AI would generate response here]';
        finalOutput = step.output;
        break;

      case 'api_call':
        step.output = `[API call to ${currentNode.data.url || 'unknown'}]`;
        break;

      default:
        step.output = `Executed: ${currentNode.type}`;
    }

    // Find outgoing edges
    const outEdges = bot.edges.filter((e) => e.source === currentNode!.nodeId);
    let nextEdge: IBotEdge | undefined;

    if (currentNode.type === 'condition' && outEdges.length > 1) {
      const field = currentNode.data.field as string;
      const operator = currentNode.data.operator as string;
      const value = currentNode.data.value as string;
      const matched = evaluateCondition(vars[field] || '', operator, value);
      nextEdge = outEdges.find((e) => e.condition === (matched ? 'true' : 'false')) || outEdges[0];
    } else {
      nextEdge = outEdges[0];
    }

    step.nextNodeId = nextEdge?.target;
    steps.push(step);

    currentNode = nextEdge ? bot.nodes.find((n) => n.nodeId === nextEdge!.target) : undefined;
  }

  return {
    botId,
    input,
    steps,
    finalOutput: finalOutput || 'No response generated',
    completed: stepCount < maxSteps,
  };
}

function interpolateVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function evaluateCondition(actual: string, operator: string, expected: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'contains':
      return actual.includes(expected);
    case 'not_contains':
      return !actual.includes(expected);
    case 'starts_with':
      return actual.startsWith(expected);
    case 'ends_with':
      return actual.endsWith(expected);
    case 'exists':
      return actual !== '' && actual !== undefined;
    case 'not_exists':
      return actual === '' || actual === undefined;
    default:
      return false;
  }
}
