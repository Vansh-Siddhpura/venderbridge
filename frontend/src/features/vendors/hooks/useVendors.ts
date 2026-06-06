import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendors, getVendorById, createVendor, updateVendor, type VendorParams } from '@/api/api';
import type { Vendor } from '@/types/api.types';
import toast from 'react-hot-toast';

export const VENDOR_KEYS = {
  all: ['vendors'] as const,
  list: (params: VendorParams) => ['vendors', 'list', params] as const,
  detail: (id: string) => ['vendors', id] as const,
};

export function useVendorsQuery(params: VendorParams) {
  return useQuery<Vendor[], Error>({
    queryKey: VENDOR_KEYS.list(params),
    queryFn: () => getVendors(params),
  });
}

export function useVendorDetailQuery(id: string) {
  return useQuery<Vendor, Error>({
    queryKey: VENDOR_KEYS.detail(id),
    queryFn: () => getVendorById(id),
    enabled: !!id,
  });
}

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation<Vendor, Error, Partial<Vendor>>({
    mutationFn: createVendor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.all });
      toast.success(`Vendor ${data.name} added successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add vendor');
    },
  });
}

export function useUpdateVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation<Vendor, Error, { id: string; data: Partial<Vendor> }>({
    mutationFn: ({ id, data }) => updateVendor(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VENDOR_KEYS.detail(data.id) });
      toast.success(`Vendor details updated!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update vendor');
    },
  });
}
