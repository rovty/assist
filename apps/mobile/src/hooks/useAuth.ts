import { useState, useCallback } from 'react';
import { api } from '../api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ token: null, isAuthenticated: false });

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string }>('/auth/login', { email, password });
    setState({ token: res.token, isAuthenticated: true });
    return res.token;
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, isAuthenticated: false });
  }, []);

  return { ...state, login, logout };
}
