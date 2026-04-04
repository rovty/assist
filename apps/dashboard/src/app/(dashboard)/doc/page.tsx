'use client';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@assist/ui';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
} from 'lucide-react';

import { FEATURE_AREAS, getAllRoleDefinitions, getPermissionLabel } from '@/lib/rbac';

const documentationMenu = [
  { id: 'overview', label: 'Platform Overview' },
  { id: 'navigation', label: 'Menu Reference' },
  { id: 'flows', label: 'Operational Flows' },
  { id: 'components', label: 'Component Reference' },
  { id: 'roles', label: 'Roles & Access' },
  { id: 'permissions', label: 'Permission Matrix' },
] as const;

const audienceSegments = [
  'SMEs',
  'E-commerce brands',
  'Clinics',
  'Education providers',
  'Service businesses',
] as const;

const menuGuide = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    summary: 'Workspace overview with high-level business and support metrics.',
    purpose: 'Gives the team an at-a-glance view of operational health.',
    components: ['Stats cards', 'Analytics summary data'],
  },
  {
    label: 'Conversations',
    href: '/conversations',
    icon: MessageSquare,
    summary: 'Inbox-style workspace for customer chats across web and messaging channels.',
    purpose: 'Lets agents and teams review incoming conversations and continue the thread.',
    components: ['Conversation list', 'Conversation detail', 'Message input'],
  },
  {
    label: 'Bots',
    href: '/bots',
    icon: Bot,
    summary: 'Bot management area for conversation automation and flow performance.',
    purpose: 'Helps teams create, review, and manage automated engagement flows.',
    components: ['Bot list', 'Create bot action', 'Bot status badges'],
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: Users,
    summary: 'Pipeline board for captured leads and follow-up stages.',
    purpose: 'Turns customer conversations into trackable business opportunities.',
    components: ['Pipeline board', 'Stage columns', 'Lead cards'],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    summary: 'Performance reporting for conversations, agents, bots, and satisfaction.',
    purpose: 'Shows how well the platform is performing and where to improve.',
    components: ['Overview cards', 'Tabbed analytics views', 'Chart containers'],
  },
  {
    label: 'Knowledge Base',
    href: '/knowledge-base',
    icon: BookOpen,
    summary: 'Knowledge source management for AI answers and bot responses.',
    purpose: 'Lets teams control the information used by AI-driven support.',
    components: ['Source cards', 'Knowledge search test', 'Source status indicators'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    summary: 'Workspace configuration, team setup, channels, and integrations.',
    purpose: 'Central place for system setup and operational control.',
    components: ['Tabbed settings layout', 'Workspace form', 'Timezone selector'],
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
    summary: 'Subscription, usage, and upgrade management.',
    purpose: 'Helps workspace owners monitor plan limits and manage growth.',
    components: ['Current plan card', 'Usage meter', 'Plan cards'],
  },
  {
    label: 'Documentation',
    href: '/doc',
    icon: BookOpen,
    summary: 'Internal reference page for platform structure, menus, workflows, and access design.',
    purpose: 'Keeps operational guidance separate from day-to-day product screens.',
    components: ['Documentation menu', 'Section anchors', 'Reference content'],
  },
  {
    label: 'Account',
    href: '/account',
    icon: UserCircle2,
    summary: 'Profile and session area for the signed-in user.',
    purpose: 'Shows current workspace identity and provides sign out access.',
    components: ['Profile card', 'Role badge', 'Session card'],
  },
] as const;

const flowGuide = [
  {
    title: 'Authentication and workspace entry',
    steps: [
      'User lands on sign in or register.',
      'User continues with Google, Microsoft, password, or magic link.',
      'Successful auth redirects to the dashboard.',
      'Role and permissions determine what menus and actions appear.',
    ],
  },
  {
    title: 'Customer conversation handling',
    steps: [
      'A customer starts a chat from web or messaging channels.',
      'The conversation appears in the Conversations inbox.',
      'The team opens a thread from the list panel.',
      'Agents reply in the detail panel if their role allows it.',
    ],
  },
  {
    title: 'Lead capture and follow-up',
    steps: [
      'Incoming conversations generate or support lead opportunities.',
      'Leads are tracked in the pipeline board by stage.',
      'Sales or service teams move leads through contact and qualification flow.',
      'The board becomes the operating view for follow-up work.',
    ],
  },
  {
    title: 'AI automation and knowledge workflow',
    steps: [
      'Teams manage response automation through Bots.',
      'Knowledge sources are added and maintained in Knowledge Base.',
      'Bots and AI answers rely on those sources for more accurate engagement.',
      'Analytics helps evaluate response quality and automation impact.',
    ],
  },
  {
    title: 'Workspace administration',
    steps: [
      'Owners and admins configure workspace behavior in Settings.',
      'Owners manage subscription and limits in Billing.',
      'Role-based visibility keeps sensitive controls away from lower-access users.',
      'Documentation provides a stable reference for how the system is organized.',
    ],
  },
] as const;

const componentGroups = [
  {
    title: 'Layout and navigation components',
    details: [
      'Sidebar controls the main dashboard navigation and account entry.',
      'Header provides search, theme toggle, notifications, and profile actions.',
      'AuthGuard protects dashboard routes and redirects unauthenticated users.',
      'Providers wrap theme, query caching, toast state, and auth state.',
    ],
  },
  {
    title: 'Conversation workspace components',
    details: [
      'ConversationList shows searchable threads with contact, preview, and unread state.',
      'ConversationDetail shows the selected thread context and messages.',
      'MessageInput supports replying and switches to read-only for restricted roles.',
    ],
  },
  {
    title: 'Growth and automation components',
    details: [
      'BotList shows available automation flows and their status.',
      'PipelineBoard organizes leads into stage-based columns.',
      'Knowledge Base source cards show sync state and management actions.',
    ],
  },
  {
    title: 'Reporting and admin components',
    details: [
      'OverviewCards summarize important analytics metrics.',
      'ChartContainer reserves the reporting area for deeper chart visualizations.',
      'UsageMeter shows resource consumption against plan limits.',
      'PlanCards present plan comparisons and upgrade actions.',
    ],
  },
] as const;

export default function DocumentationPage() {
  const roleDefinitions = getAllRoleDefinitions();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <Card className="border-border/80">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit gap-2 px-3 py-1 text-xs uppercase tracking-[0.18em]">
                <BookOpen className="h-3.5 w-3.5" />
                Documentation
              </Badge>
              <div>
                <CardTitle className="text-lg">Documentation Menu</CardTitle>
                <CardDescription>
                  Use these sections to review product structure without mixing operational guidance and access policy.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {documentationMenu.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-8">
          <section id="overview" className="scroll-mt-24 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">Omnichannel AI Platform Guide</h1>
              <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                Rovty is an omnichannel AI platform that automates customer conversations, captures leads, and
                provides 24/7 engagement across web and messaging channels. The dashboard is designed as the operating
                system for support, sales, automation, analytics, and workspace administration.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                  <CardDescription>What the system does and how the current design is positioned.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    This platform is meant to centralize customer conversations, AI-assisted engagement, lead capture,
                    workflow automation, and business visibility in a single workspace.
                  </p>
                  <p>
                    The dashboard structure supports teams that need fast customer response, better lead conversion,
                    and controlled workspace administration without switching between multiple systems.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Customers</CardTitle>
                  <CardDescription>Primary business types supported by this system design.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {audienceSegments.map((segment) => (
                      <Badge key={segment} variant="secondary">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Best suited for organizations that manage frequent inbound questions, online inquiries, appointment
                    demand, or service-driven lead generation.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What The Dashboard Must Support</CardTitle>
                <CardDescription>These are the core operational jobs the current product design is built around.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 text-sm leading-6 text-muted-foreground">
                <p>Customer support teams need a fast conversation inbox and AI-assisted response workflow.</p>
                <p>Sales teams need lead capture and pipeline visibility from incoming conversations.</p>
                <p>Operations teams need automation, knowledge management, analytics, and workspace controls.</p>
                <p>Owners need billing visibility, role-based access, and a clear management surface.</p>
              </CardContent>
            </Card>
          </section>

          <section id="navigation" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Menu Reference</CardTitle>
                <CardDescription>
                  This section documents every visible menu in the current design and explains how each menu works.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {menuGuide.map((item) => (
                  <div key={item.label} className="rounded-xl border bg-background p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold">{item.label}</h2>
                            <Badge variant="outline">{item.href}</Badge>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">Business purpose</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Main components</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.components.map((component) => (
                            <Badge key={component} variant="secondary">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="flows" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Operational Flows</CardTitle>
                <CardDescription>
                  These flows explain how users and teams move through the system from entry to ongoing operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {flowGuide.map((flow) => (
                  <div key={flow.title} className="rounded-xl border bg-background p-5">
                    <h3 className="text-base font-semibold">{flow.title}</h3>
                    <div className="mt-4 space-y-3">
                      {flow.steps.map((step, index) => (
                        <div key={step} className="flex items-start gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                            {index < flow.steps.length - 1 ? (
                              <ArrowRight className="hidden h-4 w-4 text-muted-foreground lg:block" />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="components" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Component Reference</CardTitle>
                <CardDescription>
                  This section maps visible screens and workflows to the reusable components in the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {componentGroups.map((group) => (
                  <div key={group.title} className="rounded-xl border bg-background p-5">
                    <h3 className="text-base font-semibold">{group.title}</h3>
                    <div className="mt-3 space-y-2">
                      {group.details.map((detail) => (
                        <p key={detail} className="text-sm leading-6 text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="roles" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Roles & Access Control</CardTitle>
                </div>
                <CardDescription>
                  This section is intentionally separated from the product guide so access policy does not get mixed
                  with feature explanations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roleDefinitions.map((role) => (
                  <div key={role.role} className="rounded-xl border bg-background p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{role.label}</h3>
                      <Badge variant="outline">{role.role}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <Badge key={`${role.role}-${permission}`} variant="secondary">
                          {getPermissionLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section id="permissions" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  This is the feature-level reference for how the current UI ties business areas to access rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {FEATURE_AREAS.map((feature) => (
                  <div key={feature.key} className="rounded-xl border bg-background p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold">{feature.label}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{getPermissionLabel(feature.viewPermission)}</Badge>
                        {feature.managePermission ? (
                          <Badge variant="outline">{getPermissionLabel(feature.managePermission)}</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
