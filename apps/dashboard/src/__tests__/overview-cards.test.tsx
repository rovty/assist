import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverviewCards } from '@/components/analytics/overview-cards';

const mockStats = {
  totalConversations: 12450,
  avgResponseTime: '2.5m',
  csatScore: '94%',
  activeAgents: 8,
  openConversations: 42,
  activeBots: 5,
  totalLeads: 320,
  resolutionRate: '87%',
};

vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: vi.fn(() => ({
    data: mockStats,
    isLoading: false,
  })),
}));

import { useAnalytics } from '@/hooks/use-analytics';
const mockedUseAnalytics = vi.mocked(useAnalytics);

describe('OverviewCards', () => {
  it('renders all four metric labels', () => {
    render(<OverviewCards />);
    expect(screen.getByText('Total Conversations')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    expect(screen.getByText('CSAT Score')).toBeInTheDocument();
    expect(screen.getByText('Active Agents')).toBeInTheDocument();
  });

  it('renders metric values when loaded', () => {
    render(<OverviewCards />);
    expect(screen.getByText('12450')).toBeInTheDocument();
    expect(screen.getByText('2.5m')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('shows dash when loading', () => {
    mockedUseAnalytics.mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<OverviewCards />);
    const dashes = screen.getAllByText('—');
    expect(dashes).toHaveLength(4);
  });
});
