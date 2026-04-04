import { describe, expect, it } from 'vitest';

import { canAccessPath, getPermissionsForRole, normalizeRole } from '@/lib/rbac';

describe('rbac definitions', () => {
  it('keeps owner access broader than agent access', () => {
    const ownerPermissions = getPermissionsForRole('OWNER');
    const agentPermissions = getPermissionsForRole('AGENT');

    expect(ownerPermissions).toContain('billing:manage');
    expect(agentPermissions).not.toContain('billing:view');
    expect(agentPermissions).toContain('conversations:reply');
  });

  it('falls back unknown roles to viewer', () => {
    expect(normalizeRole('super-admin')).toBe('VIEWER');
  });

  it('blocks settings routes when the permission is missing', () => {
    const viewerPermissions = getPermissionsForRole('VIEWER');

    expect(canAccessPath('/settings', viewerPermissions)).toBe(false);
    expect(canAccessPath('/analytics', viewerPermissions)).toBe(true);
  });
});
