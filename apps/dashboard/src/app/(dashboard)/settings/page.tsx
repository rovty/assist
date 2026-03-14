'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@assist/ui';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '@assist/ui';
import { Settings2, Users, Radio, Puzzle, UserPlus, Save, ChevronsUpDown, Check } from 'lucide-react';

const timezones = Intl.supportedValuesOf('timeZone');

function TimezoneSelect({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => timezones.filter((tz) => tz.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  useEffect(() => { setHighlighted(-1); }, [search]);

  const select = useCallback((tz: string) => {
    onChange(tz);
    setOpen(false);
    setSearch('');
    setHighlighted(-1);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => {
        const next = prev < filtered.length - 1 ? prev + 1 : 0;
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => {
        const next = prev > 0 ? prev - 1 : filtered.length - 1;
        listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter' && highlighted >= 0 && highlighted < filtered.length) {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setSearch('');
      setHighlighted(-1);
    }
  }, [open, filtered, highlighted, select]);

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className={value ? '' : 'text-muted-foreground'}>{value || 'Select timezone…'}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search timezones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div ref={listRef} className="max-h-60 overflow-y-auto px-1 pb-1">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No timezone found</p>
            ) : (
              filtered.map((tz, i) => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => select(tz)}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
                    i === highlighted
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Check className={`h-4 w-4 shrink-0 ${tz === value ? 'opacity-100' : 'opacity-0'}`} />
                  {tz}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [timezone, setTimezone] = useState('UTC');

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
                <TimezoneSelect value={timezone} onChange={setTimezone} />
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
