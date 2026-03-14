import type { AssistConfig, Message } from './types';

const DEFAULT_API = 'http://localhost:3000';

function getApiUrl(config?: AssistConfig): string {
  return config?.apiUrl ?? DEFAULT_API;
}

export async function fetchMessages(config: AssistConfig, conversationId: string): Promise<Message[]> {
  const res = await fetch(`${getApiUrl(config)}/conversations/${encodeURIComponent(conversationId)}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  const data = await res.json();
  return data.messages;
}

export async function sendMessage(config: AssistConfig, conversationId: string, text: string): Promise<Message> {
  const res = await fetch(`${getApiUrl(config)}/conversations/${encodeURIComponent(conversationId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sender: 'contact' }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function createConversation(config: AssistConfig, contact: { name: string; email: string }): Promise<{ conversationId: string }> {
  const res = await fetch(`${getApiUrl(config)}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: config.workspaceId,
      channel: 'widget',
      contact,
    }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export async function checkOnlineStatus(config: AssistConfig): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl(config)}/workspaces/${encodeURIComponent(config.workspaceId)}/status`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.online;
  } catch {
    return false;
  }
}
