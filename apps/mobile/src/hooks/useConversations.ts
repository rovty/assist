import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Conversation } from '../types';

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get<{ conversations: Conversation[] }>('/conversations');
      return res.conversations;
    },
  });
}
