import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreChatForm } from '../components/PreChatForm';

vi.mock('../store', () => ({
  setContactInfo: vi.fn(),
}));

import { setContactInfo } from '../store';
const mockedSetContactInfo = vi.mocked(setContactInfo);

describe('PreChatForm', () => {
  beforeEach(() => {
    mockedSetContactInfo.mockClear();
  });

  it('renders heading', () => {
    render(<PreChatForm />);
    expect(screen.getByText('Before we start')).toBeInTheDocument();
  });

  it('renders name and email inputs', () => {
    render(<PreChatForm />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders Start Chat button', () => {
    render(<PreChatForm />);
    expect(screen.getByText('Start Chat')).toBeInTheDocument();
  });

  it('calls setContactInfo on valid submit', () => {
    render(<PreChatForm />);
    fireEvent.input(screen.getByPlaceholderText('Your name'), { target: { value: 'Alice' } });
    fireEvent.input(screen.getByPlaceholderText('you@example.com'), { target: { value: 'alice@test.com' } });
    fireEvent.submit(screen.getByText('Start Chat'));
    expect(mockedSetContactInfo).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@test.com' });
  });

  it('does not call setContactInfo with empty fields', () => {
    render(<PreChatForm />);
    fireEvent.submit(screen.getByText('Start Chat'));
    expect(mockedSetContactInfo).not.toHaveBeenCalled();
  });
});
