import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Providers } from '@/components/providers';

vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="query-provider">{children}</div>,
}));

vi.mock('@assist/ui', async () => {
  const actual = await vi.importActual<typeof import('@assist/ui')>('@assist/ui');
  return {
    ...actual,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>,
  };
});

describe('Providers', () => {
  it('renders children', () => {
    render(<Providers><span>Hello</span></Providers>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('wraps with QueryClientProvider', () => {
    render(<Providers><span>Child</span></Providers>);
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
  });

  it('wraps with ThemeProvider', () => {
    render(<Providers><span>Child</span></Providers>);
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('wraps with ToastProvider', () => {
    render(<Providers><span>Child</span></Providers>);
    expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
  });
});
