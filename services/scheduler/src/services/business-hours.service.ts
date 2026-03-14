import { createLogger } from '@assist/shared-utils';
import { getBusinessHours, isWithinBusinessHours } from './scheduler.service.js';

const logger = createLogger('scheduler:business-hours');

export async function checkBusinessHours(tenantId: string): Promise<boolean> {
  const config = await getBusinessHours(tenantId);
  if (!config) return true; // No config = always open

  return isWithinBusinessHours(config);
}
