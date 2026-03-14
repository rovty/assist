// ─── Scheduler Types ───

export enum JobStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum JobType {
  AUTO_CLOSE = 'auto_close',
  SLA_CHECK = 'sla_check',
  REMINDER = 'reminder',
  REPORT = 'report',
  CUSTOM = 'custom',
}

export interface ScheduledJob {
  id: string;
  tenantId: string;
  name: string;
  type: JobType;
  cron: string;
  data: Record<string, unknown>;
  status: JobStatus;
  nextRun?: string;
  lastRun?: string;
  executionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DaySchedule {
  open: string;  // HH:mm
  close: string; // HH:mm
}

export interface BusinessHoursConfig {
  timezone: string;
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface SLAPolicy {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  targets: Record<string, SLATarget>; // priority → targets
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SLATarget {
  firstResponseMinutes: number;
  resolutionMinutes: number;
}
