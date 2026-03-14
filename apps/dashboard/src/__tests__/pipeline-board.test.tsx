import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PipelineBoard } from '@/components/leads/pipeline-board';

const mockLeads = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', company: 'Acme Inc', stage: 'New', score: 85 },
  { id: '2', name: 'Jane Smith', email: 'jane@corp.com', company: 'Corp Ltd', stage: 'Qualified', score: 72 },
  { id: '3', name: 'Bob Wilson', email: 'bob@test.com', company: 'Test Co', stage: 'New' },
];

vi.mock('@/hooks/use-leads', () => ({
  useLeads: vi.fn(() => ({
    data: mockLeads,
    isLoading: false,
  })),
}));

import { useLeads } from '@/hooks/use-leads';
const mockedUseLeads = vi.mocked(useLeads);

describe('PipelineBoard', () => {
  it('renders all five stages', () => {
    render(<PipelineBoard />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Proposal')).toBeInTheDocument();
    expect(screen.getByText('Won')).toBeInTheDocument();
  });

  it('renders lead names in correct stages', () => {
    render(<PipelineBoard />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('renders company names', () => {
    render(<PipelineBoard />);
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('Corp Ltd')).toBeInTheDocument();
  });

  it('shows lead score badges when present', () => {
    render(<PipelineBoard />);
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('shows stage count badges', () => {
    render(<PipelineBoard />);
    // New has 2 leads, Qualified has 1, rest has 0
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockedUseLeads.mockReturnValue({ data: undefined, isLoading: true } as any);
    render(<PipelineBoard />);
    const loadingTexts = screen.getAllByText('Loading…');
    expect(loadingTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty stages when no leads', () => {
    mockedUseLeads.mockReturnValue({ data: [], isLoading: false } as any);
    render(<PipelineBoard />);
    const emptyTexts = screen.getAllByText('No leads');
    expect(emptyTexts).toHaveLength(5);
  });
});
