'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button, Avatar, Input, Badge } from '@assist/ui';
import { Search, Bell, Moon, Sun, LogOut, Settings, ChevronDown, UserCircle2 } from 'lucide-react';
import { useTheme } from '@assist/ui';

import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useAuthorization } from '@/hooks/use-authorization';

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const { session, user, tenant } = useAuth();
  const { can, roleDefinition } = useAuthorization();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const displayName = user?.name ?? session?.user.user_metadata?.name ?? session?.user.email?.split('@')[0] ?? 'Account';
  const displayEmail = user?.email ?? session?.user.email ?? 'Signed-in user';
  const displayTenant = tenant?.name ?? 'Workspace';
  const avatarSrc = user?.avatarUrl ?? session?.user.user_metadata?.avatar_url ?? undefined;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="w-64 pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {mounted ? (
            resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-transparent px-1 py-1 transition-colors hover:border-border hover:bg-muted/60"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open profile menu"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Avatar name={displayName} src={avatarSrc} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-sm font-medium">{displayName}</p>
              <p className="max-w-28 truncate text-xs text-muted-foreground">{displayTenant}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border bg-popover p-2 shadow-lg"
            >
              <div className="border-b px-3 py-3">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-popover-foreground">{displayName}</p>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em]">
                    {roleDefinition.label}
                  </Badge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                <p className="truncate text-xs text-muted-foreground">{displayTenant}</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/account"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                  Account
                </Link>
                {can('settings:view') ? (
                  <Link
                    href="/settings"
                    role="menuitem"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </Link>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
