'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, cn } from '@assist/ui';
import {
  MessageSquare,
  Bot,
  Users,
  BarChart3,
  BookOpen,
  FileText,
  Settings,
  CreditCard,
  LayoutDashboard,
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { useAuthorization } from '@/hooks/use-authorization';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' as const },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare, permission: 'conversations:view' as const },
  { href: '/bots', label: 'Bots', icon: Bot, permission: 'bots:view' as const },
  { href: '/leads', label: 'Leads', icon: Users, permission: 'leads:view' as const },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics:view' as const },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, permission: 'knowledge-base:view' as const },
  { href: '/settings', label: 'Settings', icon: Settings, permission: 'settings:view' as const },
  { href: '/billing', label: 'Billing', icon: CreditCard, permission: 'billing:view' as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { session, user, tenant } = useAuth();
  const { can, roleDefinition } = useAuthorization();
  const displayName = user?.name ?? session?.user.user_metadata?.name ?? session?.user.email?.split('@')[0] ?? 'Account';
  const displayTenant = tenant?.name ?? 'Workspace';
  const displayMeta = user?.role ? `${roleDefinition.label} access` : (session?.user.email ?? 'Signed in');
  const avatarSrc = user?.avatarUrl ?? session?.user.user_metadata?.avatar_url ?? undefined;
  const visibleNavItems = navItems.filter((item) => can(item.permission));
  const docsActive = pathname.startsWith('/doc');

  return (
    <aside className="flex w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg">Assist</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-4 py-3">
        <Link
          href="/doc"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            docsActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <FileText className="h-4 w-4" />
          Documentation
        </Link>
      </div>

      <div className="border-t px-4 py-3">
        <Link href="/account" className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted">
          <Avatar name={displayName} src={avatarSrc} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayTenant}</p>
            <p className="truncate text-xs text-muted-foreground">{displayMeta}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
