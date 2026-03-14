import { createLogger } from '@assist/shared-utils';
import { Lead } from '../models/lead.model.js';
import { Activity } from '../models/activity.model.js';

const logger = createLogger('lead-crm:scoring');

interface ScoreFactors {
  profileCompleteness: number;
  engagement: number;
  recency: number;
  channel: number;
  manualBoost: number;
}

const WEIGHTS: Record<keyof ScoreFactors, number> = {
  profileCompleteness: 20,
  engagement: 30,
  recency: 25,
  channel: 15,
  manualBoost: 10,
};

export async function calculateScore(tenantId: string, leadId: string): Promise<number> {
  const lead = await Lead.findOne({ _id: leadId, tenantId });
  if (!lead) return 0;

  const activityCount = await Activity.countDocuments({ leadId, tenantId });

  // Profile completeness (0-1)
  let profileScore = 0;
  if (lead.name) profileScore += 0.2;
  if (lead.email) profileScore += 0.3;
  if (lead.phone) profileScore += 0.2;
  if (lead.company) profileScore += 0.2;
  if (lead.title) profileScore += 0.1;

  // Engagement (0-1) based on activity count
  const engagementScore = Math.min(activityCount / 20, 1);

  // Recency (0-1) based on last activity
  let recencyScore = 0;
  const lastActivity = lead.lastActivityAt || lead.createdAt;
  const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity < 1) recencyScore = 1;
  else if (daysSinceActivity < 7) recencyScore = 0.8;
  else if (daysSinceActivity < 14) recencyScore = 0.6;
  else if (daysSinceActivity < 30) recencyScore = 0.4;
  else if (daysSinceActivity < 90) recencyScore = 0.2;

  // Channel weight (0-1)
  const channelWeights: Record<string, number> = {
    web: 0.5,
    email: 0.7,
    whatsapp: 0.8,
    phone: 0.9,
    referral: 1.0,
  };
  const channelScore = channelWeights[lead.source] || 0.5;

  // Manual boost (0-1) — from existing custom score
  const manualBoost = Math.min((lead.customFields?.manualScore as number) || 0, 100) / 100;

  // Weighted sum
  const totalScore = Math.round(
    profileScore * WEIGHTS.profileCompleteness +
    engagementScore * WEIGHTS.engagement +
    recencyScore * WEIGHTS.recency +
    channelScore * WEIGHTS.channel +
    manualBoost * WEIGHTS.manualBoost
  );

  // Update lead score
  lead.score = totalScore;
  await lead.save();

  // Log score change
  await Activity.create({
    tenantId,
    leadId,
    type: 'score_change',
    title: `Score updated to ${totalScore}`,
    metadata: {
      previousScore: lead.score,
      newScore: totalScore,
      factors: { profileScore, engagementScore, recencyScore, channelScore, manualBoost },
    },
    performedBy: 'system',
  });

  logger.info({ leadId, score: totalScore }, 'Lead score calculated');
  return totalScore;
}
