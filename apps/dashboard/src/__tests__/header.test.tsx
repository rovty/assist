import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '@/components/layout/header';

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
    const { container } = render(<Header />);
    const avatar = container.querySelector('[name="Agent"]');
    expect(avatar).toBeInTheDocument();
  });
});
