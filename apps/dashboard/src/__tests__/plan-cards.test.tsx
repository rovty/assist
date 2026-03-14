import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanCards } from '@/components/billing/plan-cards';

describe('PlanCards', () => {
  it('renders all three plans', () => {
    render(<PlanCards />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
  });

  it('renders plan descriptions', () => {
    render(<PlanCards />);
    expect(screen.getByText('For small teams getting started')).toBeInTheDocument();
    expect(screen.getByText('For growing teams')).toBeInTheDocument();
    expect(screen.getByText('For large organizations')).toBeInTheDocument();
  });

  it('marks Pro plan as popular', () => {
    render(<PlanCards />);
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('renders Upgrade buttons for paid plans', () => {
    render(<PlanCards />);
    const upgradeButtons = screen.getAllByRole('button', { name: 'Upgrade' });
    expect(upgradeButtons).toHaveLength(2);
  });

  it('renders Contact Sales for Enterprise', () => {
    render(<PlanCards />);
    expect(screen.getByRole('button', { name: 'Contact Sales' })).toBeInTheDocument();
  });

  it('renders feature lists', () => {
    render(<PlanCards />);
    expect(screen.getByText('Up to 3 agents')).toBeInTheDocument();
    expect(screen.getByText('Up to 10 agents')).toBeInTheDocument();
    expect(screen.getByText('Unlimited agents')).toBeInTheDocument();
  });
});
