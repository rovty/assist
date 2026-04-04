export const APP_ROLES = ['OWNER', 'ADMIN', 'AGENT', 'VIEWER'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const APP_PERMISSIONS = [
  'dashboard:view',
  'conversations:view',
  'conversations:reply',
  'bots:view',
  'bots:manage',
  'leads:view',
  'leads:manage',
  'analytics:view',
  'knowledge-base:view',
  'knowledge-base:manage',
  'settings:view',
  'settings:manage',
  'team:manage',
  'channels:manage',
  'integrations:manage',
  'billing:view',
  'billing:manage',
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

type RoleDefinition = {
  label: string;
  description: string;
  permissions: AppPermission[];
};

type FeatureArea = {
  key: string;
  label: string;
  description: string;
  viewPermission: AppPermission;
  managePermission?: AppPermission;
};

export const FEATURE_AREAS: FeatureArea[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'See workspace health, volume, and top-level activity.',
    viewPermission: 'dashboard:view',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    description: 'Open customer threads and reply when your role allows it.',
    viewPermission: 'conversations:view',
    managePermission: 'conversations:reply',
  },
  {
    key: 'bots',
    label: 'Bots',
    description: 'Review automation performance and edit bot flows.',
    viewPermission: 'bots:view',
    managePermission: 'bots:manage',
  },
  {
    key: 'leads',
    label: 'Leads',
    description: 'Work the pipeline and add or update lead records.',
    viewPermission: 'leads:view',
    managePermission: 'leads:manage',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'View performance dashboards and reporting trends.',
    viewPermission: 'analytics:view',
  },
  {
    key: 'knowledge-base',
    label: 'Knowledge Base',
    description: 'Browse knowledge sources and manage AI content syncs.',
    viewPermission: 'knowledge-base:view',
    managePermission: 'knowledge-base:manage',
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'Manage workspace configuration, channels, and integrations.',
    viewPermission: 'settings:view',
    managePermission: 'settings:manage',
  },
  {
    key: 'billing',
    label: 'Billing',
    description: 'Review plans, usage, and subscription controls.',
    viewPermission: 'billing:view',
    managePermission: 'billing:manage',
  },
];

const ROLE_DEFINITION_MAP: Record<AppRole, RoleDefinition> = {
  OWNER: {
    label: 'Owner',
    description: 'Full workspace control, including billing, configuration, and team access.',
    permissions: [...APP_PERMISSIONS],
  },
  ADMIN: {
    label: 'Admin',
    description: 'Operational control across the workspace, without subscription billing ownership.',
    permissions: [
      'dashboard:view',
      'conversations:view',
      'conversations:reply',
      'bots:view',
      'bots:manage',
      'leads:view',
      'leads:manage',
      'analytics:view',
      'knowledge-base:view',
      'knowledge-base:manage',
      'settings:view',
      'settings:manage',
      'team:manage',
      'channels:manage',
      'integrations:manage',
    ],
  },
  AGENT: {
    label: 'Agent',
    description: 'Hands-on support access for conversations and leads, with read-only visibility elsewhere.',
    permissions: [
      'dashboard:view',
      'conversations:view',
      'conversations:reply',
      'bots:view',
      'leads:view',
      'leads:manage',
      'analytics:view',
      'knowledge-base:view',
    ],
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only workspace visibility for monitoring and reporting.',
    permissions: [
      'dashboard:view',
      'conversations:view',
      'bots:view',
      'leads:view',
      'analytics:view',
      'knowledge-base:view',
    ],
  },
};

const PERMISSION_LABELS: Record<AppPermission, string> = {
  'dashboard:view': 'View dashboard overview',
  'conversations:view': 'View conversations',
  'conversations:reply': 'Reply to conversations',
  'bots:view': 'View bots',
  'bots:manage': 'Create and edit bots',
  'leads:view': 'View leads',
  'leads:manage': 'Create and update leads',
  'analytics:view': 'View analytics',
  'knowledge-base:view': 'View knowledge sources',
  'knowledge-base:manage': 'Manage knowledge sources',
  'settings:view': 'Open workspace settings',
  'settings:manage': 'Edit workspace settings',
  'team:manage': 'Manage team members',
  'channels:manage': 'Manage channels',
  'integrations:manage': 'Manage integrations',
  'billing:view': 'View billing',
  'billing:manage': 'Manage billing and subscription',
};

const ROUTE_REQUIREMENTS: Array<{ matcher: RegExp; permission: AppPermission }> = [
  { matcher: /^\/$/, permission: 'dashboard:view' },
  { matcher: /^\/conversations(?:\/|$)/, permission: 'conversations:view' },
  { matcher: /^\/bots(?:\/|$)/, permission: 'bots:view' },
  { matcher: /^\/leads(?:\/|$)/, permission: 'leads:view' },
  { matcher: /^\/analytics(?:\/|$)/, permission: 'analytics:view' },
  { matcher: /^\/knowledge-base(?:\/|$)/, permission: 'knowledge-base:view' },
  { matcher: /^\/settings(?:\/|$)/, permission: 'settings:view' },
  { matcher: /^\/billing(?:\/|$)/, permission: 'billing:view' },
];

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return 'VIEWER';

  const normalized = role.toUpperCase();
  return APP_ROLES.find((value) => value === normalized) ?? 'VIEWER';
}

export function isAppPermission(value: string): value is AppPermission {
  return (APP_PERMISSIONS as readonly string[]).includes(value);
}

export function getRoleDefinition(role: AppRole): RoleDefinition {
  return ROLE_DEFINITION_MAP[role];
}

export function getAllRoleDefinitions() {
  return APP_ROLES.map((role) => ({
    role,
    ...ROLE_DEFINITION_MAP[role],
  }));
}

export function getPermissionLabel(permission: AppPermission): string {
  return PERMISSION_LABELS[permission];
}

export function getPermissionsForRole(role: AppRole): AppPermission[] {
  return [...ROLE_DEFINITION_MAP[role].permissions];
}

export function getEffectivePermissions(roleInput?: string | null, explicitPermissions?: string[] | null): AppPermission[] {
  const explicit = (explicitPermissions ?? []).filter(isAppPermission);
  if (explicit.length > 0) {
    return explicit;
  }

  return getPermissionsForRole(normalizeRole(roleInput));
}

export function hasPermission(permissions: readonly string[] | null | undefined, permission: AppPermission): boolean {
  return (permissions ?? []).includes(permission);
}

export function canAccessPath(pathname: string, permissions: readonly string[] | null | undefined): boolean {
  const requirement = ROUTE_REQUIREMENTS.find(({ matcher }) => matcher.test(pathname));
  if (!requirement) return true;
  return hasPermission(permissions, requirement.permission);
}

export function getFeatureAccessSummary(permissions: readonly string[]) {
  return FEATURE_AREAS.map((feature) => ({
    ...feature,
    canView: hasPermission(permissions, feature.viewPermission),
    canManage: feature.managePermission ? hasPermission(permissions, feature.managePermission) : false,
  }));
}
