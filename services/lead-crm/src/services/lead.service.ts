import { createLogger } from '@assist/shared-utils';
import { Lead } from '../models/lead.model.js';
import { Activity } from '../models/activity.model.js';
import type { CreateLead, UpdateLead } from '../schemas/lead.schema.js';

const logger = createLogger('lead-crm:lead-service');

export async function createLead(tenantId: string, userId: string, data: CreateLead) {
  const lead = await Lead.create({
    tenantId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    title: data.title,
    source: data.source,
    tags: data.tags || [],
    customFields: data.customFields || {},
    pipelineId: data.pipelineId,
    stageId: data.stageId,
    stageMovedAt: data.stageId ? new Date() : undefined,
    conversationId: data.conversationId,
    contactId: data.contactId,
    createdBy: userId,
  });

  logger.info({ leadId: lead.id }, 'Lead created');
  return lead;
}

export async function getLead(tenantId: string, leadId: string) {
  return Lead.findOne({ _id: leadId, tenantId });
}

export async function listLeads(
  tenantId: string,
  opts: {
    status?: string;
    source?: string;
    pipelineId?: string;
    stageId?: string;
    assignedTo?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
    page: number;
    limit: number;
  },
) {
  const filter: Record<string, unknown> = { tenantId };
  if (opts.status) filter.status = opts.status;
  if (opts.source) filter.source = opts.source;
  if (opts.pipelineId) filter.pipelineId = opts.pipelineId;
  if (opts.stageId) filter.stageId = opts.stageId;
  if (opts.assignedTo) filter.assignedTo = opts.assignedTo;
  if (opts.search) {
    filter.$or = [
      { name: { $regex: opts.search, $options: 'i' } },
      { email: { $regex: opts.search, $options: 'i' } },
      { company: { $regex: opts.search, $options: 'i' } },
    ];
  }

  const sort: Record<string, 1 | -1> = {
    [opts.sortBy]: opts.sortOrder === 'asc' ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function updateLead(tenantId: string, leadId: string, data: UpdateLead) {
  return Lead.findOneAndUpdate(
    { _id: leadId, tenantId },
    { $set: data },
    { new: true },
  );
}

export async function deleteLead(tenantId: string, leadId: string) {
  await Promise.all([
    Lead.deleteOne({ _id: leadId, tenantId }),
    Activity.deleteMany({ leadId, tenantId }),
  ]);
  return true;
}

export async function moveLeadToStage(
  tenantId: string,
  leadId: string,
  userId: string,
  pipelineId: string,
  stageId: string,
) {
  const lead = await Lead.findOne({ _id: leadId, tenantId });
  if (!lead) return null;

  const previousStage = lead.stageId;
  lead.pipelineId = pipelineId;
  lead.stageId = stageId;
  lead.stageMovedAt = new Date();
  await lead.save();

  // Log the stage change as an activity
  await Activity.create({
    tenantId,
    leadId,
    type: 'stage_change',
    title: `Moved to stage ${stageId}`,
    metadata: { previousStage, newStage: stageId, pipelineId },
    performedBy: userId,
  });

  lead.lastActivityAt = new Date();
  await lead.save();

  logger.info({ leadId, stageId }, 'Lead moved to stage');
  return lead;
}

export async function logActivity(
  tenantId: string,
  leadId: string,
  userId: string,
  data: { type: string; title: string; description?: string; metadata?: Record<string, unknown> },
) {
  const activity = await Activity.create({
    tenantId,
    leadId,
    type: data.type,
    title: data.title,
    description: data.description,
    metadata: data.metadata || {},
    performedBy: userId,
  });

  await Lead.findOneAndUpdate(
    { _id: leadId, tenantId },
    { $set: { lastActivityAt: new Date() } },
  );

  return activity;
}

export async function listActivities(
  tenantId: string,
  leadId: string,
  opts: { type?: string; page: number; limit: number },
) {
  const filter: Record<string, unknown> = { tenantId, leadId };
  if (opts.type) filter.type = opts.type;

  const [data, total] = await Promise.all([
    Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .lean(),
    Activity.countDocuments(filter),
  ]);

  return { data, total, page: opts.page, limit: opts.limit };
}

export async function getLeadStats(tenantId: string) {
  const [byStatus, bySource, total, avgScore] = await Promise.all([
    Lead.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    Lead.countDocuments({ tenantId }),
    Lead.aggregate([
      { $match: { tenantId } },
      { $group: { _id: null, avg: { $avg: '$score' } } },
    ]),
  ]);

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    bySource: Object.fromEntries(bySource.map((s) => [s._id, s.count])),
    averageScore: avgScore[0]?.avg || 0,
  };
}
