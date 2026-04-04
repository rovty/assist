'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button, useTheme } from '@assist/ui';

export function AuthThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="fixed right-4 top-4 z-50 border-slate-300 bg-white/90 text-slate-700 shadow-sm hover:border-slate-400 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={mounted && resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mounted ? (
        resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <span className="h-4 w-4" />
      )}
    </Button>
  );
}
