'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@assist/ui';

import { GoogleIcon, MicrosoftIcon } from '@/components/auth/provider-icons';

interface SocialAuthButtonProps {
  disabled?: boolean;
  loading?: boolean;
  provider: 'google' | 'microsoft';
  label: string;
  onClick: () => void;
}

export function SocialAuthButton({
  disabled = false,
  loading = false,
  provider,
  label,
  onClick,
}: SocialAuthButtonProps) {
  const Icon = provider === 'google' ? GoogleIcon : MicrosoftIcon;

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-center gap-3 border-slate-300 bg-slate-50 px-4 text-center text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white"
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
    </Button>
  );
}
