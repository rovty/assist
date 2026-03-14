import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getToken, getProfile } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<{ data: User }>({
    queryKey: ['auth', 'me'],
    queryFn: () => getProfile(),
    enabled: !!getToken(),
    retry: false,
  });

  return {
    user: user?.data ?? null,
    isLoading,
    isAuthenticated: !!user?.data,
    error,
  };
}
