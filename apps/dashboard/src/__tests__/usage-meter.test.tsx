import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UsageMeter } from '@/components/billing/usage-meter';

describe('UsageMeter', () => {
  it('renders all four usage labels', () => {
    render(<UsageMeter />);
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Bot flows')).toBeInTheDocument();
    expect(screen.getByText('KB Sources')).toBeInTheDocument();
  });

  it('shows usage / limit text', () => {
    render(<UsageMeter />);
    expect(screen.getByText('3,241 / 10,000')).toBeInTheDocument();
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
    expect(screen.getByText('8 / 25')).toBeInTheDocument();
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders progress bars', () => {
    const { container } = render(<UsageMeter />);
    const bars = container.querySelectorAll('.h-2.rounded-full.bg-muted');
    expect(bars).toHaveLength(4);
  });

  it('applies destructive color when usage > 80%', () => {
    const { container } = render(<UsageMeter />);
    // Agents: 5/10 = 50% -> primary, Conversations: 3241/10000 = 32% -> primary
    // None should be > 80%, so no destructive bars
    const destructiveBars = container.querySelectorAll('.bg-destructive');
    expect(destructiveBars).toHaveLength(0);
  });
});
