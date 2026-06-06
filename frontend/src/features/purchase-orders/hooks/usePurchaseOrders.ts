import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPurchaseOrders, getPOById, updatePOStatus, createInvoiceFromPO, type POParams } from '@/api/api';
import type { POStatus } from '@/types/enums';
import toast from 'react-hot-toast';

export const PO_KEYS = {
  all: ['purchase-orders'] as const,
  list: (params: POParams) => ['purchase-orders', 'list', params] as const,
  detail: (id: string) => ['purchase-orders', id] as const,
};

export function usePOsQuery(params: POParams) {
  return useQuery<any[], Error>({
    queryKey: PO_KEYS.list(params),
    queryFn: () => getPurchaseOrders(params),
  });
}

export function usePODetailQuery(id: string) {
  return useQuery<any, Error>({
    queryKey: PO_KEYS.detail(id),
    queryFn: () => getPOById(id),
    enabled: !!id,
  });
}

export function useUpdatePOStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; status: POStatus }>({
    mutationFn: ({ id, status }) => updatePOStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PO_KEYS.detail(data.id) });
      toast.success(`Purchase Order status updated to ${data.status}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update PO status');
    },
  });
}

export function useCreateInvoiceFromPOMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { poId: string; notes: string }>({
    mutationFn: ({ poId, notes }) => createInvoiceFromPO(poId, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PO_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success(`Invoice ${data.invoiceNumber} generated from PO successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate invoice');
    },
  });
}
