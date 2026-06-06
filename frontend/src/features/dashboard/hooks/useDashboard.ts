import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/api';

export const DASHBOARD_KEYS = {
  stats: ['dashboard', 'stats'] as const,
};

export function useDashboardQuery() {
  return useQuery<any, Error>({
    queryKey: DASHBOARD_KEYS.stats,
    queryFn: getDashboardStats,
  });
}
