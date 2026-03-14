import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Conversation {
  id: string;
  contactName: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
  status: string;
  channel: string;
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get<{ conversations: Conversation[] }>('/conversations');
      return res.data.conversations;
    },
  });
}
