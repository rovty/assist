import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/dialog';

describe('Dialog', () => {
  it('does not render when closed', () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent>Hidden</DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders content when open', () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>Visible</DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when backdrop is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
    // Click the backdrop (the bg-black/80 overlay)
    const backdrop = document.querySelector('.bg-black\\/80');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('sets body overflow hidden when open', () => {
    const { unmount } = render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>Content</DialogContent>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders full dialog composition', () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>My Title</DialogTitle>
            <DialogDescription>My Description</DialogDescription>
          </DialogHeader>
          <p>Body text</p>
          <DialogFooter>
            <button>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('DialogTitle renders h2', () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Heading</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Heading').tagName).toBe('H2');
  });

  it('DialogDescription renders p', () => {
    render(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogDescription>Desc</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText('Desc').tagName).toBe('P');
  });
});
