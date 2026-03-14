import { describe, it, expect, beforeEach } from 'vitest';
import {
  getState,
  subscribe,
  toggleOpen,
  setOpen,
  addMessage,
  setMessages,
  setTyping,
  setContactInfo,
  setOnline,
} from '../store';

// The store module holds state across tests. We need a fresh state each time.
// Since there's no reset function, we'll test behavior rather than absolute state.

describe('Widget Store', () => {
  it('returns initial state', () => {
    const state = getState();
    expect(state).toHaveProperty('isOpen');
    expect(state).toHaveProperty('messages');
    expect(state).toHaveProperty('isTyping');
    expect(state).toHaveProperty('unreadCount');
    expect(state).toHaveProperty('contactInfo');
    expect(state).toHaveProperty('isOnline');
  });

  it('toggleOpen flips isOpen', () => {
    const before = getState().isOpen;
    toggleOpen();
    expect(getState().isOpen).toBe(!before);
    toggleOpen(); // restore
  });

  it('setOpen sets isOpen explicitly', () => {
    setOpen(true);
    expect(getState().isOpen).toBe(true);
    setOpen(false);
    expect(getState().isOpen).toBe(false);
  });

  it('resets unread count when opening', () => {
    setOpen(false);
    addMessage({ id: 'a1', sender: 'agent', text: 'Hi', timestamp: Date.now() });
    expect(getState().unreadCount).toBeGreaterThan(0);
    setOpen(true);
    expect(getState().unreadCount).toBe(0);
  });

  it('addMessage appends to messages', () => {
    const countBefore = getState().messages.length;
    addMessage({ id: 'msg1', sender: 'contact', text: 'Hello', timestamp: Date.now() });
    expect(getState().messages.length).toBe(countBefore + 1);
  });

  it('increments unread when not open and sender is not contact', () => {
    setOpen(false);
    const countBefore = getState().unreadCount;
    addMessage({ id: 'msg2', sender: 'agent', text: 'Reply', timestamp: Date.now() });
    expect(getState().unreadCount).toBe(countBefore + 1);
  });

  it('does not increment unread for contact messages', () => {
    setOpen(false);
    const countBefore = getState().unreadCount;
    addMessage({ id: 'msg3', sender: 'contact', text: 'My msg', timestamp: Date.now() });
    expect(getState().unreadCount).toBe(countBefore);
  });

  it('setMessages replaces all messages', () => {
    const msgs = [{ id: 'r1', sender: 'bot' as const, text: 'Welcome', timestamp: Date.now() }];
    setMessages(msgs);
    expect(getState().messages).toEqual(msgs);
  });

  it('setTyping sets typing indicator', () => {
    setTyping(true);
    expect(getState().isTyping).toBe(true);
    setTyping(false);
    expect(getState().isTyping).toBe(false);
  });

  it('setContactInfo stores contact', () => {
    setContactInfo({ name: 'Alice', email: 'alice@test.com' });
    expect(getState().contactInfo).toEqual({ name: 'Alice', email: 'alice@test.com' });
  });

  it('setOnline sets online status', () => {
    setOnline(false);
    expect(getState().isOnline).toBe(false);
    setOnline(true);
    expect(getState().isOnline).toBe(true);
  });

  it('subscribe notifies listeners on state change', () => {
    let called = false;
    const unsub = subscribe(() => { called = true; });
    setTyping(!getState().isTyping);
    expect(called).toBe(true);
    unsub();
  });

  it('unsubscribe stops notifications', () => {
    let count = 0;
    const unsub = subscribe(() => { count++; });
    setTyping(true);
    unsub();
    setTyping(false);
    expect(count).toBe(1);
  });
});
