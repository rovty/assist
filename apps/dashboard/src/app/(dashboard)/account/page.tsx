'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Avatar, Badge } from '@assist/ui';

import { logout } from '@/lib/auth';
import { useAuth } from '@/hooks/use-auth';
import { useAuthorization } from '@/hooks/use-authorization';

export default function AccountPage() {
  const { session, user, tenant } = useAuth();
  const { roleDefinition } = useAuthorization();

  const displayName = user?.name ?? session?.user.user_metadata?.name ?? session?.user.email?.split('@')[0] ?? 'Account';
  const displayEmail = user?.email ?? session?.user.email ?? 'Signed-in user';
  const displayTenant = tenant?.name ?? 'Workspace';
  const displayRole = roleDefinition.label;
  const avatarSrc = user?.avatarUrl ?? session?.user.user_metadata?.avatar_url ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and signed-in workspace details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your current workspace identity and role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={displayName} src={avatarSrc} size="md" className="ring-1 ring-border" />
              <div className="min-w-0">
                <p className="text-lg font-semibold">{displayName}</p>
                <p className="truncate text-sm text-muted-foreground">{displayEmail}</p>
                <Badge variant="outline" className="mt-2">{displayRole}</Badge>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
                <p className="mt-2 text-sm font-medium">{displayTenant}</p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Role</p>
                <p className="mt-2 text-sm font-medium">{displayRole}</p>
                <p className="mt-1 text-xs text-muted-foreground">{roleDefinition.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Sign out when you need to switch users or workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are currently signed in to the dashboard with this account. Use sign out if you want to switch users.
            </p>
            <Button variant="destructive" onClick={() => void logout()}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
