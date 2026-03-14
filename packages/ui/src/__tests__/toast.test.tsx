import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../components/toast';

// Helper component to trigger toasts in tests
function ToastTrigger({ title, description, variant }: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' }) {
  const { addToast } = useToast();
  return (
    <button onClick={() => addToast({ title, description, variant, duration: 100_000 })}>
      Add Toast
    </button>
  );
}

function RemovableTrigger() {
  const { addToast, toasts, removeToast } = useToast();
  return (
    <>
      <button onClick={() => addToast({ title: 'Test', duration: 100_000 })}>Add</button>
      <button onClick={() => toasts[0] && removeToast(toasts[0].id)}>Remove</button>
      <span data-testid="count">{toasts.length}</span>
    </>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast with title', async () => {
    vi.useRealTimers();
    render(
      <ToastProvider>
        <ToastTrigger title="Success!" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders toast with description', async () => {
    vi.useRealTimers();
    render(
      <ToastProvider>
        <ToastTrigger title="Note" description="Something happened" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add Toast' }));
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('auto-dismisses toast after duration', async () => {
    render(
      <ToastProvider>
        <ToastTrigger title="Temp" />
      </ToastProvider>,
    );
    // Use act because we're clicking in fake timer mode
    act(() => {
      screen.getByRole('button', { name: 'Add Toast' }).click();
    });
    expect(screen.getByText('Temp')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(100_001);
    });
    expect(screen.queryByText('Temp')).not.toBeInTheDocument();
  });

  it('removes toast manually', async () => {
    vi.useRealTimers();
    render(
      <ToastProvider>
        <RemovableTrigger />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('renders multiple toasts', async () => {
    vi.useRealTimers();
    render(
      <ToastProvider>
        <ToastTrigger title="Toast" />
      </ToastProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Add Toast' });
    await userEvent.click(btn);
    await userEvent.click(btn);
    expect(screen.getAllByText('Toast')).toHaveLength(2);
  });

  it('throws when useToast is used outside provider', () => {
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useToast must be used within <ToastProvider>');
  });
});
