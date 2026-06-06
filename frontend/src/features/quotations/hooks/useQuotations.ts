import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuotations, submitQuotation, approveQuotation, rejectQuotation, type QuotationParams } from '@/api/api';
import toast from 'react-hot-toast';

export const QUOTATION_KEYS = {
  all: ['quotations'] as const,
  list: (params: QuotationParams) => ['quotations', 'list', params] as const,
  detail: (id: string) => ['quotations', id] as const,
};

export function useQuotationsQuery(params: QuotationParams) {
  return useQuery<any[], Error>({
    queryKey: QUOTATION_KEYS.list(params),
    queryFn: () => getQuotations(params),
  });
}

export function useSubmitQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: submitQuotation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: QUOTATION_KEYS.all });
      toast.success(`Quotation ${data.quotationNumber} submitted successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit quotation');
    },
  });
}

export function useApproveQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; comments: string }>({
    mutationFn: ({ id, comments }) => approveQuotation(id, comments),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: QUOTATION_KEYS.all });
      toast.success(`Quotation ${data.quotationNumber} approved! Purchase Order generated.`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to approve quotation');
    },
  });
}

export function useRejectQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; comments: string }>({
    mutationFn: ({ id, comments }) => rejectQuotation(id, comments),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: QUOTATION_KEYS.all });
      toast.success(`Quotation ${data.quotationNumber} rejected.`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to reject quotation');
    },
  });
}
