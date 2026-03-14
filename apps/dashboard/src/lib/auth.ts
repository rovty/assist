import { api } from './api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export async function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export async function getProfile() {
  return api.get<{ id: string; name: string; email: string; role: string }>('/auth/me');
}
