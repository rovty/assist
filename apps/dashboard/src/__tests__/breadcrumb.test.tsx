import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Breadcrumb } from '@/components/layout/breadcrumb';

describe('Breadcrumb', () => {
  it('renders home icon link', () => {
    render(<Breadcrumb items={[{ label: 'Page' }]} />);
    const homeLink = screen.getByRole('link');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders text-only item when no href', () => {
    render(<Breadcrumb items={[{ label: 'Current Page' }]} />);
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('renders linked items with href', () => {
    render(<Breadcrumb items={[{ label: 'Parent', href: '/parent' }, { label: 'Child' }]} />);
    expect(screen.getByText('Parent').closest('a')).toHaveAttribute('href', '/parent');
    expect(screen.getByText('Child').closest('a')).toBeNull();
  });

  it('renders chevron separators', () => {
    render(<Breadcrumb items={[{ label: 'A' }, { label: 'B' }]} />);
    // 2 items = 2 chevrons (one per item)
    const svgs = document.querySelectorAll('svg');
    // 1 home icon + 2 chevrons = 3 total svgs
    expect(svgs.length).toBe(3);
  });
});
