import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageInput } from '../components/MessageInput';
import type { AssistConfig } from '../types';

vi.mock('../store', () => ({
  addMessage: vi.fn(),
}));

import { addMessage } from '../store';
const mockedAddMessage = vi.mocked(addMessage);

const config: AssistConfig = { workspaceId: 'ws-1' };

describe('Widget MessageInput', () => {
  beforeEach(() => {
    mockedAddMessage.mockClear();
  });

  it('renders input and send button', () => {
    render(<MessageInput config={config} />);
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });

  it('send button is disabled when input is empty', () => {
    render(<MessageInput config={config} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('enables send button after typing', () => {
    render(<MessageInput config={config} />);
    fireEvent.input(screen.getByPlaceholderText('Type a message…'), { target: { value: 'Hello' } });
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('calls addMessage and clears input on send', () => {
    render(<MessageInput config={config} />);
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.input(input, { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button'));
    expect(mockedAddMessage).toHaveBeenCalledTimes(1);
    expect(mockedAddMessage.mock.calls[0][0]).toMatchObject({
      sender: 'contact',
      text: 'Hello there',
    });
  });

  it('sends on Enter key', () => {
    render(<MessageInput config={config} />);
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.input(input, { target: { value: 'Enter test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockedAddMessage).toHaveBeenCalledTimes(1);
  });

  it('does not send on Shift+Enter', () => {
    render(<MessageInput config={config} />);
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.input(input, { target: { value: 'Multiline' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(mockedAddMessage).not.toHaveBeenCalled();
  });
});
