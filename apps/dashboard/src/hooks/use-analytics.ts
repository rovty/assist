import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface AnalyticsStats {
  openConversations: number;
  activeBots: number;
  totalLeads: number;
  resolutionRate: string;
  totalConversations: number;
  avgResponseTime: string;
  csatScore: string;
  activeAgents: number;
}

export function useAnalytics() {
  return useQuery<AnalyticsStats>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await api.get<AnalyticsStats>('/analytics/overview');
      return res.data;
    },
  });
}
