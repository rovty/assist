import { createLogger, generateId } from '@assist/shared-utils';
import { Pipeline } from '../models/pipeline.model.js';
import { Lead } from '../models/lead.model.js';
import type { CreatePipeline, UpdatePipeline } from '../schemas/lead.schema.js';

const logger = createLogger('lead-crm:pipeline-service');

export async function createPipeline(tenantId: string, userId: string, data: CreatePipeline) {
  const stages = data.stages.map((s, i) => ({
    stageId: generateId('stg'),
    name: s.name,
    order: i,
    color: s.color,
  }));

  if (data.isDefault) {
    await Pipeline.updateMany({ tenantId, isDefault: true }, { $set: { isDefault: false } });
  }

  const pipeline = await Pipeline.create({
    tenantId,
    name: data.name,
    description: data.description || '',
    stages,
    isDefault: data.isDefault || false,
    createdBy: userId,
  });

  logger.info({ pipelineId: pipeline.id }, 'Pipeline created');
  return pipeline;
}

export async function getPipeline(tenantId: string, pipelineId: string) {
  const pipeline = await Pipeline.findOne({ _id: pipelineId, tenantId }).lean();
  if (!pipeline) return null;

  // Get lead counts per stage
  const stageCounts = await Lead.aggregate([
    { $match: { tenantId, pipelineId: pipeline._id.toString() } },
    { $group: { _id: '$stageId', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(stageCounts.map((s) => [s._id, s.count]));
  const stagesWithCounts = pipeline.stages.map((stage) => ({
    ...stage,
    leadCount: countMap[stage.stageId] || 0,
  }));

  return { ...pipeline, stages: stagesWithCounts };
}

export async function listPipelines(tenantId: string) {
  return Pipeline.find({ tenantId }).sort({ isDefault: -1, createdAt: -1 }).lean();
}

export async function updatePipeline(tenantId: string, pipelineId: string, data: UpdatePipeline) {
  const update: Record<string, unknown> = {};
  if (data.name) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.isDefault !== undefined) {
    if (data.isDefault) {
      await Pipeline.updateMany({ tenantId, isDefault: true }, { $set: { isDefault: false } });
    }
    update.isDefault = data.isDefault;
  }
  if (data.stages) {
    update.stages = data.stages.map((s, i) => ({
      stageId: s.stageId || generateId('stg'),
      name: s.name,
      order: i,
      color: s.color,
    }));
  }

  return Pipeline.findOneAndUpdate(
    { _id: pipelineId, tenantId },
    { $set: update },
    { new: true },
  );
}

export async function deletePipeline(tenantId: string, pipelineId: string) {
  await Pipeline.deleteOne({ _id: pipelineId, tenantId });
  // Unset pipeline from leads
  await Lead.updateMany(
    { tenantId, pipelineId },
    { $unset: { pipelineId: 1, stageId: 1, stageMovedAt: 1 } },
  );
  return true;
}
