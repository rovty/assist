'use client';

import type { Provider } from '@supabase/supabase-js';

import { api } from './api';
import { getSupabaseClient } from './supabase';
import { DASHBOARD_PATH, LOGIN_PATH } from './routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const LOGOUT_MARKER_KEY = 'assist.auth.logged-out-at';
const LOGOUT_MARKER_TTL_MS = 10_000;

function clearBrowserAuthState() {
  if (typeof window === 'undefined') return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const keys = Object.keys(storage);
    for (const key of keys) {
      if (key.startsWith('sb-') || key === 'supabase.auth.token') {
        storage.removeItem(key);
      }
    }
  }
}

export function markRecentLogout() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LOGOUT_MARKER_KEY, Date.now().toString());
}

export function clearRecentLogout() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LOGOUT_MARKER_KEY);
}

export function hasRecentLogout() {
  if (typeof window === 'undefined') return false;

  const rawValue = window.sessionStorage.getItem(LOGOUT_MARKER_KEY);
  if (!rawValue) return false;

  const loggedOutAt = Number(rawValue);
  if (!Number.isFinite(loggedOutAt) || Date.now() - loggedOutAt > LOGOUT_MARKER_TTL_MS) {
    clearRecentLogout();
    return false;
  }

  return true;
}

export interface AuthProfile {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  authorization: {
    tenantId: string;
    role: string;
    permissions: string[];
  };
  identities: Array<{
    id: string;
    provider: string;
    email?: string | null;
    supabaseUserId: string;
    lastUsedAt?: string | null;
  }>;
}

function getRedirectTarget(nextPath?: string): string {
  if (typeof window === 'undefined') return DASHBOARD_PATH;
  const target = nextPath || window.location.pathname || DASHBOARD_PATH;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;
}

export async function getToken(): Promise<string | null> {
  const { data } = await getSupabaseClient().auth.getSession();
  return data.session?.access_token ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getToken()) !== null;
}

export async function signInWithPassword(email: string, password: string) {
  clearRecentLogout();
  const { error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  name: string;
  tenantName: string;
}) {
  clearRecentLogout();
  const { error } = await getSupabaseClient().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        name: input.name,
        tenantName: input.tenantName,
      },
      emailRedirectTo: getRedirectTarget(DASHBOARD_PATH),
    },
  });

  if (error) throw error;
}

export async function signInWithMagicLink(email: string, nextPath?: string) {
  clearRecentLogout();
  const { error } = await getSupabaseClient().auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: getRedirectTarget(nextPath),
    },
  });

  if (error) throw error;
}

export async function signInWithSocial(provider: Provider, nextPath?: string) {
  clearRecentLogout();
  const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getRedirectTarget(nextPath),
      scopes: provider === 'azure' ? 'email openid profile offline_access' : 'email profile',
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (!data?.url) {
    throw new Error(
      provider === 'azure'
        ? 'Microsoft sign-in is not available yet. Check that the Azure provider is enabled in Supabase and that its redirect URL is configured.'
        : 'Google sign-in is not available yet. Check that the Google provider is enabled in Supabase and that its redirect URL is configured.',
    );
  }

  if (typeof window !== 'undefined') {
    window.location.assign(data.url);
  }
}

export async function logout() {
  const supabase = getSupabaseClient();
  const token = await getToken();
  markRecentLogout();

  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => undefined);
  }

  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  clearBrowserAuthState();
  window.location.replace(LOGIN_PATH);
}

export async function getProfile(): Promise<AuthProfile> {
  const response = await api.get<{ success: boolean; data: AuthProfile }>('/auth/me');
  return response.data.data;
}
