'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading, isAuthenticated, error } = useAuth();
  const errorMessage = error instanceof Error ? error.message : '';
  const isConfigError = errorMessage.includes('Supabase is not configured');

  useEffect(() => {
    if (!isLoading && !session && !isConfigError) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isConfigError, isLoading, pathname, router, session]);

  if (isConfigError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <div className="max-w-lg rounded-lg border bg-card p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Authentication needs setup</h1>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!session || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Redirecting to login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {errorMessage && !isConfigError ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Workspace profile could not be loaded, so the dashboard may show limited access. Error: {errorMessage}
        </div>
      ) : null}
      {children}
    </>
  );
}
