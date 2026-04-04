'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DASHBOARD_PATH } from '@/lib/routes';
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase';

function getNextPath(): string {
  if (typeof window === 'undefined') return DASHBOARD_PATH;
  return new URLSearchParams(window.location.search).get('next') || DASHBOARD_PATH;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign-in…');

  useEffect(() => {
    const configError = getSupabaseConfigError();
    if (configError) {
      setMessage(configError);
      return;
    }

    const supabase = getSupabaseClient();

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace(getNextPath());
        return;
      }

      setMessage('Waiting for Supabase session…');
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Authentication callback</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
