import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders default variant with primary background', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-primary');
  });

  it('renders secondary variant', () => {
    render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-secondary');
  });

  it('renders destructive variant', () => {
    render(<Badge variant="destructive" data-testid="badge">Error</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-destructive');
  });

  it('renders outline variant', () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    expect(screen.getByTestId('badge').className).toContain('text-foreground');
  });

  it('renders success variant', () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-green');
  });

  it('renders warning variant', () => {
    render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
    expect(screen.getByTestId('badge').className).toContain('bg-yellow');
  });

  it('applies custom className', () => {
    render(<Badge className="extra" data-testid="badge">X</Badge>);
    expect(screen.getByTestId('badge').className).toContain('extra');
  });

  it('renders as rounded pill', () => {
    render(<Badge data-testid="badge">Pill</Badge>);
    expect(screen.getByTestId('badge').className).toContain('rounded-full');
  });
});
