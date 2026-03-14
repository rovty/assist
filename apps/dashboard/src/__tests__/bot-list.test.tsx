import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BotList } from '@/components/bots/bot-list';

const mockBots = [
  { id: '1', name: 'Welcome Bot', status: 'published', triggerCount: 5, conversations: 120 },
  { id: '2', name: 'Support Bot', status: 'draft', triggerCount: 3, conversations: 0 },
  { id: '3', name: 'Sales Bot', status: 'paused', triggerCount: 2, conversations: 45 },
];

vi.mock('@/hooks/use-bots', () => ({
  useBots: vi.fn(() => ({
    data: mockBots,
    isLoading: false,
  })),
}));

import { useBots } from '@/hooks/use-bots';
const mockedUseBots = vi.mocked(useBots);

describe('BotList', () => {
  it('renders bot names', () => {
    render(<BotList />);
    expect(screen.getByText('Welcome Bot')).toBeInTheDocument();
    expect(screen.getByText('Support Bot')).toBeInTheDocument();
    expect(screen.getByText('Sales Bot')).toBeInTheDocument();
  });

  it('shows status badges', () => {
    render(<BotList />);
    expect(screen.getByText('published')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('displays trigger count', () => {
    render(<BotList />);
    expect(screen.getByText('5 triggers')).toBeInTheDocument();
    expect(screen.getByText('3 triggers')).toBeInTheDocument();
  });

  it('displays conversation count', () => {
    render(<BotList />);
    expect(screen.getByText('120 conversations')).toBeInTheDocument();
    expect(screen.getByText('0 conversations')).toBeInTheDocument();
  });

  it('shows edit buttons', () => {
    render(<BotList />);
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    expect(editButtons).toHaveLength(3);
  });

  it('shows loading state', () => {
    mockedUseBots.mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<BotList />);
    expect(screen.getByText('Loading bots…')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    mockedUseBots.mockReturnValue({ data: [], isLoading: false } as any);
    render(<BotList />);
    expect(screen.getByText('No bots created yet')).toBeInTheDocument();
  });
});
