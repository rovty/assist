import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface BillingInfo {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  usage: {
    conversations: { used: number; limit: number };
    agents: { used: number; limit: number };
  };
}

export function useBilling() {
  return useQuery<BillingInfo>({
    queryKey: ['billing'],
    queryFn: async () => {
      const res = await api.get<BillingInfo>('/billing');
      return res.data;
    },
  });
}
