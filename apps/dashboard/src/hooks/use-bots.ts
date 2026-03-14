import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BotItem {
  id: string;
  name: string;
  status: string;
  triggerCount: number;
  conversations: number;
}

export function useBots() {
  return useQuery<BotItem[]>({
    queryKey: ['bots'],
    queryFn: async () => {
      const res = await api.get<{ bots: BotItem[] }>('/bots');
      return res.data.bots;
    },
  });
}
