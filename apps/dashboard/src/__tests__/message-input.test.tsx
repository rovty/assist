import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MessageInput } from '@/components/conversations/message-input';

describe('MessageInput', () => {
  it('renders input and send button', () => {
    render(<MessageInput conversationId="conv_1" />);
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    render(<MessageInput conversationId="conv_1" />);
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find((b) => b.querySelector('svg'));
    // The last button is send
    const lastBtn = buttons[buttons.length - 1];
    expect(lastBtn).toBeDisabled();
  });

  it('enables send button when text is entered', async () => {
    render(<MessageInput conversationId="conv_1" />);
    await userEvent.type(screen.getByPlaceholderText('Type a message…'), 'Hello');
    const buttons = screen.getAllByRole('button');
    const lastBtn = buttons[buttons.length - 1];
    expect(lastBtn).not.toBeDisabled();
  });

  it('clears input after send', async () => {
    render(<MessageInput conversationId="conv_1" />);
    const input = screen.getByPlaceholderText('Type a message…');
    await userEvent.type(input, 'Hello');
    
    const buttons = screen.getAllByRole('button');
    const lastBtn = buttons[buttons.length - 1];
    await userEvent.click(lastBtn);
    
    expect(input).toHaveValue('');
  });

  it('does not clear on empty send attempt', async () => {
    render(<MessageInput conversationId="conv_1" />);
    const buttons = screen.getAllByRole('button');
    const lastBtn = buttons[buttons.length - 1];
    await userEvent.click(lastBtn);
    // Nothing to clear, no crash
    expect(screen.getByPlaceholderText('Type a message…')).toHaveValue('');
  });
});
