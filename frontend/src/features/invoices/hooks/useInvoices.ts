import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoices, getInvoiceById, updateInvoiceStatus, type InvoiceParams } from '@/api/api';
import type { InvoiceStatus } from '@/types/enums';
import toast from 'react-hot-toast';

export const INVOICE_KEYS = {
  all: ['invoices'] as const,
  list: (params: InvoiceParams) => ['invoices', 'list', params] as const,
  detail: (id: string) => ['invoices', id] as const,
};

export function useInvoicesQuery(params: InvoiceParams) {
  return useQuery<any[], Error>({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: () => getInvoices(params),
  });
}

export function useInvoiceDetailQuery(id: string) {
  return useQuery<any, Error>({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
}

export function useUpdateInvoiceStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; status: InvoiceStatus }>({
    mutationFn: ({ id, status }) => updateInvoiceStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(data.id) });
      toast.success(`Invoice ${data.invoiceNumber} status updated to ${data.status}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update invoice status');
    },
  });
}

export function useSendEmailMutation() {
  return useMutation<any, Error, { email: string; subject: string; message: string }>({
    mutationFn: async ({ email, subject: _subject, message: _message }) => {
      // Simulate API email dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { success: true, email };
    },
    onSuccess: (data) => {
      toast.success(`Email successfully dispatched to ${data.email}!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to send email');
    },
  });
}
