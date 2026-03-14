import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/layout/sidebar';

describe('Sidebar', () => {
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
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Sidebar />);
    expect(screen.getByText('Conversations').closest('a')).toHaveAttribute('href', '/conversations');
    expect(screen.getByText('Bots').closest('a')).toHaveAttribute('href', '/bots');
    expect(screen.getByText('Leads').closest('a')).toHaveAttribute('href', '/leads');
    expect(screen.getByText('Analytics').closest('a')).toHaveAttribute('href', '/analytics');
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    expect(screen.getByText('Billing').closest('a')).toHaveAttribute('href', '/billing');
  });

  it('has 8 nav links', () => {
    render(<Sidebar />);
    const nav = document.querySelector('nav');
    const links = nav?.querySelectorAll('a');
    expect(links).toHaveLength(8);
  });
});
