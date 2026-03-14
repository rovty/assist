import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  stage: string;
  score?: number;
}

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.get<{ leads: Lead[] }>('/leads');
      return res.data.leads;
    },
  });
}
