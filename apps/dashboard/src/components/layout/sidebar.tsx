'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@assist/ui';
import {
  MessageSquare,
  Bot,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  CreditCard,
  LayoutDashboard,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/bots', label: 'Bots', icon: Bot },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg">Assist</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
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
        <Link href="/settings" className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Acme Inc</p>
            <p className="truncate text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
