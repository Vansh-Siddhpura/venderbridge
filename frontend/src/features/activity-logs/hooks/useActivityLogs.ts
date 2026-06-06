import { useQuery } from '@tanstack/react-query';
import { getActivityLogs, type LogParams } from '@/api/api';

export const LOG_KEYS = {
  all: ['activity-logs'] as const,
  list: (params: LogParams) => ['activity-logs', 'list', params] as const,
};

export function useActivityLogsQuery(params: LogParams) {
  return useQuery<any[], Error>({
    queryKey: LOG_KEYS.list(params),
    queryFn: () => getActivityLogs(params),
  });
}
