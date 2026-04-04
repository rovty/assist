'use client';

import { useMemo } from 'react';

import { useAuth } from '@/hooks/use-auth';
import {
  getEffectivePermissions,
  getFeatureAccessSummary,
  getRoleDefinition,
  hasPermission,
  normalizeRole,
  type AppPermission,
} from '@/lib/rbac';

export function useAuthorization() {
  const { user, authorization } = useAuth();

  const role = useMemo(
    () => normalizeRole(authorization?.role ?? user?.role),
    [authorization?.role, user?.role],
  );

  const permissions = useMemo(
    () => getEffectivePermissions(authorization?.role ?? user?.role, authorization?.permissions),
    [authorization?.permissions, authorization?.role, user?.role],
  );

  const roleDefinition = useMemo(() => getRoleDefinition(role), [role]);
  const featureAccess = useMemo(() => getFeatureAccessSummary(permissions), [permissions]);

  return {
    role,
    roleDefinition,
    permissions,
    featureAccess,
    can: (permission: AppPermission) => hasPermission(permissions, permission),
  };
}
