import { createLogger, generateId } from '@assist/shared-utils';
import { Bot } from '../models/bot.model.js';
import { BotVersion } from '../models/bot-version.model.js';
import type { CreateBot, UpdateBot, SaveFlow } from '../schemas/bot.schema.js';

const logger = createLogger('bot-builder:service');

export async function createBot(tenantId: string, userId: string, data: CreateBot) {
  const bot = await Bot.create({
    tenantId,
    name: data.name,
    description: data.description || '',
    trigger: data.trigger,
    nodes: [
      {
        nodeId: generateId('node'),
        type: 'trigger',
        label: 'Start',
        position: { x: 250, y: 50 },
        data: { trigger: data.trigger },
      },
    ],
    edges: [],
    createdBy: userId,
  });

  logger.info({ botId: bot.id }, 'Bot created');
  return bot;
}

export async function getBot(tenantId: string, botId: string) {
  return Bot.findOne({ _id: botId, tenantId });
}

export async function listBots(
  tenantId: string,
  opts: { status?: string; page: number; limit: number },
) {
  const filter: Record<string, unknown> = { tenantId };
  if (opts.status) filter.status = opts.status;

  const [data, total] = await Promise.all([
    Bot.find(filter)
      .sort({ updatedAt: -1 })
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .lean(),
    Bot.countDocuments(filter),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function updateBot(tenantId: string, botId: string, data: UpdateBot) {
  return Bot.findOneAndUpdate(
    { _id: botId, tenantId },
    { $set: data },
    { new: true },
  );
}

export async function deleteBot(tenantId: string, botId: string) {
  await Promise.all([
    Bot.deleteOne({ _id: botId, tenantId }),
    BotVersion.deleteMany({ botId, tenantId }),
  ]);
  return true;
}

export async function saveFlow(tenantId: string, botId: string, data: SaveFlow) {
  const update: Record<string, unknown> = {
    nodes: data.nodes,
    edges: data.edges,
  };
  if (data.variables) update.variables = data.variables;

  return Bot.findOneAndUpdate(
    { _id: botId, tenantId },
    { $set: update },
    { new: true },
  );
}

export async function getFlow(tenantId: string, botId: string) {
  const bot = await Bot.findOne({ _id: botId, tenantId }).select('nodes edges variables').lean();
  if (!bot) return null;
  return { nodes: bot.nodes, edges: bot.edges, variables: bot.variables };
}

export async function createVersion(tenantId: string, botId: string, userId: string) {
  const bot = await Bot.findOne({ _id: botId, tenantId });
  if (!bot) return null;

  const version = bot.currentVersion + 1;
  const botVersion = await BotVersion.create({
    tenantId,
    botId,
    version,
    nodes: bot.nodes,
    edges: bot.edges,
    variables: bot.variables,
    createdBy: userId,
  });

  bot.currentVersion = version;
  await bot.save();

  logger.info({ botId, version }, 'Bot version created');
  return botVersion;
}

export async function listVersions(tenantId: string, botId: string) {
  return BotVersion.find({ botId, tenantId })
    .sort({ version: -1 })
    .select('version createdBy createdAt')
    .lean();
}

export async function publishBot(tenantId: string, botId: string, userId: string) {
  const bot = await Bot.findOne({ _id: botId, tenantId });
  if (!bot) return null;

  // Create a version snapshot before publishing
  const version = bot.currentVersion + 1;
  await BotVersion.create({
    tenantId,
    botId,
    version,
    nodes: bot.nodes,
    edges: bot.edges,
    variables: bot.variables,
    createdBy: userId,
  });

  bot.status = 'published';
  bot.currentVersion = version;
  bot.publishedVersion = version;
  await bot.save();

  logger.info({ botId, version }, 'Bot published');
  return bot;
}

export async function unpublishBot(tenantId: string, botId: string) {
  return Bot.findOneAndUpdate(
    { _id: botId, tenantId, status: 'published' },
    { $set: { status: 'draft' }, $unset: { publishedVersion: 1 } },
    { new: true },
  );
}
