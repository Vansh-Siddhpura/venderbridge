import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRFQs, getRFQById, createRFQ, updateRFQ, type RFQParams } from '@/api/api';
import toast from 'react-hot-toast';

export const RFQ_KEYS = {
  all: ['rfqs'] as const,
  list: (params: RFQParams) => ['rfqs', 'list', params] as const,
  detail: (id: string) => ['rfqs', id] as const,
};

export function useRFQsQuery(params: RFQParams) {
  return useQuery<any[], Error>({
    queryKey: RFQ_KEYS.list(params),
    queryFn: () => getRFQs(params),
  });
}

export function useRFQDetailQuery(id: string) {
  return useQuery<any, Error>({
    queryKey: RFQ_KEYS.detail(id),
    queryFn: () => getRFQById(id),
    enabled: !!id,
  });
}

export function useCreateRFQMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: createRFQ,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RFQ_KEYS.all });
      toast.success(`RFQ ${data.rfqNumber} created successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create RFQ');
    },
  });
}

export function useUpdateRFQMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: ({ id, data }) => updateRFQ(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RFQ_KEYS.all });
      queryClient.invalidateQueries({ queryKey: RFQ_KEYS.detail(data.id) });
      toast.success(`RFQ updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update RFQ');
    },
  });
}
