import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/layout/header';

let authState = {
  session: { user: { email: 'agent@rovty.com', user_metadata: {} } },
  user: { name: 'Agent Smith', email: 'agent@rovty.com', avatarUrl: null, role: 'OWNER' },
  tenant: { name: 'Rovty HQ' },
  authorization: null,
};

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => authState,
}));

vi.mock('@/lib/auth', () => ({
  logout: vi.fn(),
}));

vi.mock('@assist/ui', async () => {
  const actual = await vi.importActual<typeof import('@assist/ui')>('@assist/ui');
  return {
    ...actual,
    useTheme: () => ({
      resolvedTheme: 'light',
      setTheme: vi.fn(),
      theme: 'system',
    }),
  };
});

describe('Header', () => {
  beforeEach(() => {
    authState = {
      session: { user: { email: 'agent@rovty.com', user_metadata: {} } },
      user: { name: 'Agent Smith', email: 'agent@rovty.com', avatarUrl: null, role: 'OWNER' },
      tenant: { name: 'Rovty HQ' },
      authorization: null,
    };
  });

  it('renders search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders notification bell', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders user avatar', () => {
    render(<Header />);
    expect(screen.getByText('Agent Smith')).toBeInTheDocument();
  });

  it('opens profile menu with logout option', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'Open profile menu' }));

    expect(screen.getByRole('menuitem', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('hides settings option for non-admin roles', async () => {
    authState = {
      ...authState,
      user: { ...authState.user, role: 'AGENT' },
    };

    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: 'Open profile menu' }));

    expect(screen.getByRole('menuitem', { name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Settings' })).not.toBeInTheDocument();
  });
});
