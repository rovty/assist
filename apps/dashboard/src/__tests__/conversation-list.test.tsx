import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ConversationList } from '@/components/conversations/conversation-list';

const mockConversations = [
  { id: '1', contactName: 'Alice', lastMessage: 'Hey there', updatedAt: '2 min ago', unread: 3, status: 'open', channel: 'web' },
  { id: '2', contactName: 'Bob', lastMessage: 'Thanks!', updatedAt: '10 min ago', unread: 0, status: 'open', channel: 'email' },
];

vi.mock('@/hooks/use-conversations', () => ({
  useConversations: vi.fn(() => ({
    data: mockConversations,
    isLoading: false,
  })),
}));

import { useConversations } from '@/hooks/use-conversations';
const mockedUseConversations = vi.mocked(useConversations);

describe('ConversationList', () => {
  const onSelect = vi.fn();

  it('renders conversation items', () => {
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByPlaceholderText('Search conversations…')).toBeInTheDocument();
  });

  it('renders last message preview', () => {
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByText('Hey there')).toBeInTheDocument();
    expect(screen.getByText('Thanks!')).toBeInTheDocument();
  });

  it('shows unread badge for unread conversations', () => {
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onSelect when clicking a conversation', async () => {
    const user = userEvent.setup();
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    await user.click(screen.getByText('Alice'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('shows loading state', () => {
    mockedUseConversations.mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    mockedUseConversations.mockReturnValue({ data: [], isLoading: false } as any);
    render(<ConversationList selectedId={null} onSelect={onSelect} />);
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });
});
