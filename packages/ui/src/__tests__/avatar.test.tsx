import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '../components/avatar';

describe('Avatar', () => {
  it('renders initials from fallback prop', () => {
    render(<Avatar fallback="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single letter for single name', () => {
    render(<Avatar fallback="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders ? when no fallback provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('falls back to initials on image error', () => {
    render(<Avatar src="broken.jpg" fallback="Jane" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses sm size class', () => {
    render(<Avatar size="sm" fallback="A" data-testid="av" />);
    expect(screen.getByTestId('av').className).toContain('h-8');
  });

  it('uses md size class (default)', () => {
    render(<Avatar fallback="A" data-testid="av" />);
    expect(screen.getByTestId('av').className).toContain('h-10');
  });

  it('uses lg size class', () => {
    render(<Avatar size="lg" fallback="A" data-testid="av" />);
    expect(screen.getByTestId('av').className).toContain('h-12');
  });

  it('uses xl size class', () => {
    render(<Avatar size="xl" fallback="A" data-testid="av" />);
    expect(screen.getByTestId('av').className).toContain('h-16');
  });

  it('applies custom className', () => {
    render(<Avatar className="ring-2" data-testid="av" />);
    expect(screen.getByTestId('av').className).toContain('ring-2');
  });

  it('truncates initials to 2 characters', () => {
    render(<Avatar fallback="First Middle Last" />);
    expect(screen.getByText('FM')).toBeInTheDocument();
  });
});
