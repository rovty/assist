'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Mail } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@assist/ui';

import { hasRecentLogout, signInWithMagicLink, signInWithPassword, signInWithSocial } from '@/lib/auth';
import { DASHBOARD_PATH } from '@/lib/routes';
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase';
import { AuthThemeToggle } from '@/components/auth/auth-theme-toggle';
import { PasswordInput } from '@/components/auth/password-input';
import { SocialAuthButton } from '@/components/auth/social-auth-button';

function getNextPath(): string {
  if (typeof window === 'undefined') return DASHBOARD_PATH;
  return new URLSearchParams(window.location.search).get('next') || DASHBOARD_PATH;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState<'password' | 'google' | 'microsoft' | 'magic-link' | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const currentConfigError = getSupabaseConfigError();
    if (currentConfigError) {
      setConfigError(currentConfigError);
      setError(currentConfigError);
      return;
    }

    const supabase = getSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session && !hasRecentLogout()) {
        router.replace(getNextPath());
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const shouldRespectRecentLogout = event !== 'SIGNED_IN' && hasRecentLogout();
      if (session && !shouldRespectRecentLogout) {
        router.replace(getNextPath());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function handlePasswordLogin() {
    setError('');
    setNotice('');
    setLoading('password');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address before signing in.');
      setLoading(null);
      return;
    }

    try {
      await signInWithPassword(email, password);
      setNotice('Signed in. Redirecting to your workspace…');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(null);
    }
  }

  async function handleMagicLink() {
    setError('');
    setNotice('');
    setLoading('magic-link');

    if (!isValidEmail(email)) {
      setError('Enter a valid email address before requesting a magic link.');
      setLoading(null);
      return;
    }

    try {
      await signInWithMagicLink(email, getNextPath());
      setNotice('Magic link sent. Check your inbox to continue.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link');
    } finally {
      setLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (authMode === 'password') {
      await handlePasswordLogin();
      return;
    }

    await handleMagicLink();
  }

  async function handleSocialLogin(provider: 'google' | 'azure') {
    setError('');
    setNotice('');
    setLoading(provider === 'google' ? 'google' : 'microsoft');

    try {
      await signInWithSocial(provider, getNextPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start social login');
      setLoading(null);
    }
  }

  const authDisabled = configError !== null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#dfefff_0%,#f5f7fb_42%,#eef3f8_100%)] p-4 dark:bg-[radial-gradient(circle_at_top,#27272a_0%,#18181b_38%,#09090b_100%)]">
      <AuthThemeToggle />
      <Card className="w-full max-w-md border-slate-300/80 bg-white shadow-xl shadow-slate-300/60 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-xl bg-black px-4 py-3 shadow-sm ring-1 ring-black/10">
              <Image
                src="/brand/rovty-logo.png"
                alt="Rovty"
                width={164}
                height={34}
                priority
                className="h-auto w-[164px]"
              />
            </div>
          </div>
          <CardTitle className="text-2xl tracking-tight text-slate-900 dark:text-zinc-50">Sign in to your workspace</CardTitle>
          <CardDescription className="mx-auto max-w-sm text-sm leading-6 text-slate-700 dark:text-zinc-300">
            Continue with your organization account, social login, or a passwordless magic link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200" aria-live="polite">
              {error}
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200" aria-live="polite">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-3">
            <SocialAuthButton
              provider="google"
              label={loading === 'google' ? 'Connecting Google…' : 'Continue with Google'}
              disabled={loading !== null || authDisabled}
              loading={loading === 'google'}
              onClick={() => handleSocialLogin('google')}
            />
            <SocialAuthButton
              provider="microsoft"
              label={loading === 'microsoft' ? 'Connecting Microsoft…' : 'Continue with Microsoft'}
              disabled={loading !== null || authDisabled}
              loading={loading === 'microsoft'}
              onClick={() => handleSocialLogin('azure')}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-medium tracking-[0.18em] text-slate-500 dark:bg-zinc-950 dark:text-zinc-400">Or continue with email</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-zinc-900">
            <Button
              type="button"
              variant={authMode === 'password' ? 'default' : 'ghost'}
              className={authMode === 'password' ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'}
              disabled={loading !== null || authDisabled}
              onClick={() => {
                setAuthMode('password');
                setError('');
                setNotice('');
              }}
            >
              Password
            </Button>
            <Button
              type="button"
              variant={authMode === 'magic-link' ? 'default' : 'ghost'}
              className={authMode === 'magic-link' ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'}
              disabled={loading !== null || authDisabled}
              onClick={() => {
                setAuthMode('magic-link');
                setError('');
                setNotice('');
              }}
            >
              Magic Link
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                required
              />
              <p className="text-xs leading-5 text-slate-600 dark:text-zinc-400">
                {authMode === 'password'
                  ? 'Enter your email and password to sign in.'
                  : 'Enter your email and we will send you a secure sign-in link.'}
              </p>
            </div>

            {authMode === 'password' ? (
              <div className="space-y-2.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Password</label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  required
                />
              </div>
            ) : null}

            <div className="grid gap-3">
              <Button
                type="submit"
                className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading !== null || authDisabled}
              >
                <span>
                  {authMode === 'password'
                    ? (loading === 'password' ? 'Signing in…' : 'Sign in with password')
                    : (loading === 'magic-link' ? 'Sending magic link…' : 'Email me a magic link')}
                </span>
                {authMode === 'magic-link' ? <Mail className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {authMode === 'magic-link' ? (
                <p className="text-center text-xs leading-5 text-slate-600 dark:text-zinc-400">
                  Password not required. We&apos;ll email you a secure one-time sign-in link.
                </p>
              ) : null}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
            Need a new workspace?{' '}
            <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:text-foreground/80 hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
