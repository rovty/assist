import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { Launcher } from '../components/Launcher';

describe('Launcher', () => {
  it('renders open chat button when closed', () => {
    render(<Launcher isOpen={false} unreadCount={0} primaryColor="#6366f1" />);
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  it('renders close chat button when open', () => {
    render(<Launcher isOpen={true} unreadCount={0} primaryColor="#6366f1" />);
    expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
  });

  it('shows unread badge when closed and unread > 0', () => {
    render(<Launcher isOpen={false} unreadCount={5} primaryColor="#6366f1" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show badge when open', () => {
    render(<Launcher isOpen={true} unreadCount={3} primaryColor="#6366f1" />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('shows 9+ when unread exceeds 9', () => {
    render(<Launcher isOpen={false} unreadCount={15} primaryColor="#6366f1" />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('applies primary color as background', () => {
    render(<Launcher isOpen={false} unreadCount={0} primaryColor="#ff0000" />);
    const button = screen.getByLabelText('Open chat');
    expect(button.style.background).toBe('rgb(255, 0, 0)');
  });
});
