import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser } from '@/api/api';
import type { User } from '@/types/api.types';
import toast from 'react-hot-toast';

export const USER_KEYS = {
  all: ['users'] as const,
};

export function useUsersQuery() {
  return useQuery<User[], Error>({
    queryKey: USER_KEYS.all,
    queryFn: getUsers,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(`User ${data.email} created successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create user');
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; data: Partial<User> }>({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      toast.success(`User updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user');
    },
  });
}
