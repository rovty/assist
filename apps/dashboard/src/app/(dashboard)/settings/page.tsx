'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@assist/ui';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '@assist/ui';
import { Settings2, Users, Radio, Puzzle, UserPlus, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace settings and integrations</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="h-auto flex-wrap gap-1 p-1">
          <TabsTrigger value="general" className="inline-flex items-center gap-2 px-4 py-2">
            <Settings2 className="h-4 w-4 shrink-0" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="inline-flex items-center gap-2 px-4 py-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="inline-flex items-center gap-2 px-4 py-2">
            <Radio className="h-4 w-4 shrink-0" />
            <span>Channels</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="inline-flex items-center gap-2 px-4 py-2">
            <Puzzle className="h-4 w-4 shrink-0" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace Name</label>
                <Input defaultValue="Acme Inc" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <Input type="email" defaultValue="support@acme.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Input defaultValue="UTC" />
              </div>
              <Button>
                <Save className="h-4 w-4 shrink-0" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm">
                <UserPlus className="h-4 w-4 shrink-0" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Team management will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Channel configuration will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Third-party integrations will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
