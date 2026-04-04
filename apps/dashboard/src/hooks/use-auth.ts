'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';

import { getProfile, type AuthProfile } from '@/lib/auth';
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: AuthProfile['user'] | null;
  tenant: AuthProfile['tenant'] | null;
  authorization: AuthProfile['authorization'] | null;
  identities: AuthProfile['identities'];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuthState(): AuthContextValue {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const currentConfigError = getSupabaseConfigError();
    if (currentConfigError) {
      setConfigError(currentConfigError);
      setSession(null);
      setSessionLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    setConfigError(null);

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);

      if (event === 'SIGNED_OUT') {
        queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const profileQuery = useQuery<AuthProfile>({
    queryKey: ['auth', 'me', session?.user.id],
    queryFn: () => getProfile(),
    enabled: !!session,
    retry: false,
  });

  return {
    session,
    user: profileQuery.data?.user ?? null,
    tenant: profileQuery.data?.tenant ?? null,
    authorization: profileQuery.data?.authorization ?? null,
    identities: profileQuery.data?.identities ?? [],
    isLoading: sessionLoading || (!!session && profileQuery.isLoading && !profileQuery.isError),
    isAuthenticated: !!session,
    error: configError ? new Error(configError) : profileQuery.error,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useAuthState();
  const memoizedValue = useMemo(() => value, [value]);

  return React.createElement(AuthContext.Provider, { value: memoizedValue }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
