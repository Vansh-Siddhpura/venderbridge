import { useQuery } from '@tanstack/react-query';
import { getReportsAnalytics } from '@/api/api';

export const REPORT_KEYS = {
  all: ['reports'] as const,
};

export function useReportsQuery() {
  return useQuery<any, Error>({
    queryKey: REPORT_KEYS.all,
    queryFn: getReportsAnalytics,
  });
}
