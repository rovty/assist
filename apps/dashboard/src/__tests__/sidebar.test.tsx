import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/layout/sidebar';

let authState = {
  session: { user: { email: 'agent@rovty.com', user_metadata: {} } },
  user: { name: 'Agent Smith', email: 'agent@rovty.com', avatarUrl: null, role: 'OWNER' },
  tenant: { name: 'Rovty HQ' },
  authorization: null,
};

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => authState,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    authState = {
      session: { user: { email: 'agent@rovty.com', user_metadata: {} } },
      user: { name: 'Agent Smith', email: 'agent@rovty.com', avatarUrl: null, role: 'OWNER' },
      tenant: { name: 'Rovty HQ' },
      authorization: null,
    };
  });

  it('renders the Assist logo text', () => {
    render(<Sidebar />);
    expect(screen.getByText('Assist')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Bots')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />);
    expect(screen.getByText('Conversations').closest('a')).toHaveAttribute('href', '/conversations');
    expect(screen.getByText('Bots').closest('a')).toHaveAttribute('href', '/bots');
    expect(screen.getByText('Leads').closest('a')).toHaveAttribute('href', '/leads');
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/analytics');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    expect(screen.getByText('Billing').closest('a')).toHaveAttribute('href', '/billing');
    expect(screen.getByText('Documentation').closest('a')).toHaveAttribute('href', '/doc');
  });

  it('has 8 nav links', () => {
    render(<Sidebar />);
    const nav = document.querySelector('nav');
    const links = nav?.querySelectorAll('a');
    expect(links).toHaveLength(8);
  });

  it('renders workspace details in the footer', () => {
    render(<Sidebar />);
    expect(screen.getByText('Rovty HQ')).toBeInTheDocument();
    expect(screen.getByText('Owner access')).toBeInTheDocument();
    expect(screen.getByText('Rovty HQ').closest('a')).toHaveAttribute('href', '/account');
  });

  it('hides settings and billing for agent roles', () => {
    authState = {
      ...authState,
      user: { ...authState.user, role: 'AGENT' },
    };

    render(<Sidebar />);

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Billing')).not.toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
  });
});
