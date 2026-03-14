import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../components/skeleton';

describe('Skeleton', () => {
  it('renders a div', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk')).toBeInTheDocument();
  });

  it('has animate-pulse class', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk').className).toContain('animate-pulse');
  });

  it('has rounded-md class', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk').className).toContain('rounded-md');
  });

  it('has bg-muted class', () => {
    render(<Skeleton data-testid="sk" />);
    expect(screen.getByTestId('sk').className).toContain('bg-muted');
  });

  it('applies custom className', () => {
    render(<Skeleton data-testid="sk" className="h-4 w-24" />);
    const el = screen.getByTestId('sk');
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-24');
  });

  it('spreads additional props', () => {
    render(<Skeleton data-testid="sk" aria-label="Loading" />);
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-label', 'Loading');
  });
});
