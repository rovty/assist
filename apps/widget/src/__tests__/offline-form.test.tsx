import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { OfflineForm } from '../components/OfflineForm';
import type { AssistConfig } from '../types';

const config: AssistConfig = { workspaceId: 'ws-1' };

describe('OfflineForm', () => {
  it('renders offline heading', () => {
    render(<OfflineForm config={config} />);
    expect(screen.getByText("We're currently offline")).toBeInTheDocument();
  });

  it('renders name, email, and message fields', () => {
    render(<OfflineForm config={config} />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your message…')).toBeInTheDocument();
  });

  it('renders Send Message button', () => {
    render(<OfflineForm config={config} />);
    expect(screen.getByText('Send Message')).toBeInTheDocument();
  });

  it('shows success state after submission', () => {
    render(<OfflineForm config={config} />);
    fireEvent.input(screen.getByPlaceholderText('Your name'), { target: { value: 'Bob' } });
    fireEvent.input(screen.getByPlaceholderText('Email address'), { target: { value: 'bob@test.com' } });
    fireEvent.input(screen.getByPlaceholderText('Your message…'), { target: { value: 'Help me' } });
    fireEvent.submit(screen.getByText('Send Message'));
    expect(screen.getByText('Message sent!')).toBeInTheDocument();
  });

  it('shows follow-up message after submission', () => {
    render(<OfflineForm config={config} />);
    fireEvent.input(screen.getByPlaceholderText('Your name'), { target: { value: 'Bob' } });
    fireEvent.input(screen.getByPlaceholderText('Email address'), { target: { value: 'bob@test.com' } });
    fireEvent.input(screen.getByPlaceholderText('Your message…'), { target: { value: 'Help me' } });
    fireEvent.submit(screen.getByText('Send Message'));
    expect(screen.getByText("We'll get back to you as soon as we're online.")).toBeInTheDocument();
  });
});
