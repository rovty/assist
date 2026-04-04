'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Mail } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@assist/ui';

import { signInWithMagicLink, signInWithSocial, signUpWithPassword } from '@/lib/auth';
import { getSupabaseConfigError } from '@/lib/supabase';
import { AuthThemeToggle } from '@/components/auth/auth-theme-toggle';
import { PasswordInput } from '@/components/auth/password-input';
import { SocialAuthButton } from '@/components/auth/social-auth-button';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function RegisterPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState<'password' | 'google' | 'microsoft' | 'magic-link' | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const currentConfigError = getSupabaseConfigError();
    if (currentConfigError) {
      setConfigError(currentConfigError);
      setError(currentConfigError);
    }
  }, []);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handlePasswordSignup() {
    setError('');
    setNotice('');
    setLoading('password');

    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address before creating an account.');
      setLoading(null);
      return;
    }

    try {
      await signUpWithPassword({
        email: form.email,
        password: form.password,
        name: form.name,
        tenantName: form.workspaceName,
      });
      setNotice('Check your inbox to verify your email and finish joining the workspace.');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(null);
    }
  }

  async function handleMagicLinkSignup() {
    setError('');
    setNotice('');
    setLoading('magic-link');

    if (!isValidEmail(form.email)) {
      setError('Enter a valid email address before requesting a magic link.');
      setLoading(null);
      return;
    }

    try {
      await signInWithMagicLink(form.email, '/');
      setNotice('Magic link sent. After you verify, we will create your local workspace on first login.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link');
    } finally {
      setLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (authMode === 'password') {
      await handlePasswordSignup();
      return;
    }

    await handleMagicLinkSignup();
  }

  async function handleSocialSignup(provider: 'google' | 'azure') {
    setError('');
    setNotice('');
    setLoading(provider === 'google' ? 'google' : 'microsoft');

    try {
      await signInWithSocial(provider, '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start social signup');
      setLoading(null);
    }
  }

  const authDisabled = configError !== null;

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,#dfefff_0%,#f5f7fb_42%,#eef3f8_100%)] p-4 sm:p-6 lg:items-center dark:bg-[radial-gradient(circle_at_top,#27272a_0%,#18181b_38%,#09090b_100%)]">
      <AuthThemeToggle />
      <Card className="w-full max-w-4xl border-slate-300/80 bg-white shadow-xl shadow-slate-300/60 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/40">
        <CardHeader className="space-y-3 px-5 pt-6 text-center sm:px-6 lg:px-8 lg:pt-8">
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
          <CardTitle className="text-2xl tracking-tight text-slate-900 dark:text-zinc-50 sm:text-3xl">Create your workspace</CardTitle>
          <CardDescription className="mx-auto max-w-md text-sm leading-6 text-slate-700 dark:text-zinc-300">
            Choose Google, Microsoft, password, or magic link to get started.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
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

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">Fastest options</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Start with Google or Microsoft</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-zinc-400">
                  These providers handle identity directly, so there&apos;s no email form needed on this side.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <SocialAuthButton
                  provider="google"
                  label={loading === 'google' ? 'Connecting Google…' : 'Start with Google'}
                  disabled={loading !== null || authDisabled}
                  loading={loading === 'google'}
                  onClick={() => handleSocialSignup('google')}
                />
                <SocialAuthButton
                  provider="microsoft"
                  label={loading === 'microsoft' ? 'Connecting Microsoft…' : 'Start with Microsoft'}
                  disabled={loading !== null || authDisabled}
                  loading={loading === 'microsoft'}
                  onClick={() => handleSocialSignup('azure')}
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Want to use email instead?</p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-zinc-400">
                    Use the panel on the right for either password signup or a one-time magic link.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">Use email</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">Choose your email flow</h3>
                <p className="text-sm leading-6 text-slate-600 dark:text-zinc-400">
                  Enter your email here only for password or magic link signup.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1.5 dark:bg-zinc-950">
                <Button
                  type="button"
                  variant={authMode === 'password' ? 'default' : 'ghost'}
                  className={authMode === 'password' ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'}
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
                  className={authMode === 'magic-link' ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'}
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

              <div className="space-y-2.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Work email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={update('email')}
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  required
                />
              </div>

              {authMode === 'password' ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <label htmlFor="name" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Full name</label>
                      <Input
                        id="name"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={update('name')}
                        className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div className="space-y-2.5">
                      <label htmlFor="workspace" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Workspace name</label>
                      <Input
                        id="workspace"
                        placeholder="Acme Inc"
                        value={form.workspaceName}
                        onChange={update('workspaceName')}
                        className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-zinc-100">Password</label>
                    <PasswordInput
                      id="password"
                      value={form.password}
                      onChange={update('password')}
                      className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">Send a secure sign-in link</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                    We&apos;ll email a one-time link to this address. Your workspace can be created after your first successful login.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading !== null || authDisabled}
              >
                <span>
                  {authMode === 'password'
                    ? (loading === 'password' ? 'Creating account…' : 'Create account with password')
                    : (loading === 'magic-link' ? 'Sending magic link…' : 'Email me a magic link')}
                </span>
                {authMode === 'magic-link' ? <Mail className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-5 pb-6 pt-0 sm:px-6 lg:px-8 lg:pb-8">
          <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:text-foreground/80 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
