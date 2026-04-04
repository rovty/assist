// ─── Auth Types ───
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  VIEWER = 'VIEWER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export interface JwtPayload {
  sub: string; // userId
  tenantId: string;
  email: string;
  role: UserRole;
  supabaseUserId?: string;
  provider?: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
}

export type ApiKeyScope =
  | 'conversations:read'
  | 'conversations:write'
  | 'contacts:read'
  | 'contacts:write'
  | 'knowledge-base:read'
  | 'knowledge-base:write'
  | 'analytics:read'
  | 'webhooks:manage';
