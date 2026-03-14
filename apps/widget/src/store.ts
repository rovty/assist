import type { WidgetState, Message } from './types';

type Listener = () => void;

const initialState: WidgetState = {
  isOpen: false,
  messages: [],
  isTyping: false,
  unreadCount: 0,
  contactInfo: null,
  isOnline: true,
};

let state = { ...initialState };
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function getState(): WidgetState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleOpen() {
  state = { ...state, isOpen: !state.isOpen, unreadCount: state.isOpen ? state.unreadCount : 0 };
  notify();
}

export function setOpen(open: boolean) {
  state = { ...state, isOpen: open, unreadCount: open ? 0 : state.unreadCount };
  notify();
}

export function addMessage(message: Message) {
  state = {
    ...state,
    messages: [...state.messages, message],
    unreadCount: state.isOpen ? state.unreadCount : state.unreadCount + (message.sender !== 'contact' ? 1 : 0),
  };
  notify();
}

export function setMessages(messages: Message[]) {
  state = { ...state, messages };
  notify();
}

export function setTyping(isTyping: boolean) {
  state = { ...state, isTyping };
  notify();
}

export function setContactInfo(info: { name: string; email: string }) {
  state = { ...state, contactInfo: info };
  notify();
}

export function setOnline(isOnline: boolean) {
  state = { ...state, isOnline };
  notify();
}
