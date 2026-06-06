import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from './hooks/useUsers';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  SearchFilter,
} from '@/components/shared';
import { UserRole } from '@/types/enums';
import type { ColumnDef } from '@/components/shared/DataTable';
import { formatDateTime } from '@/utils/formatters';
import { UserPlus, UserCheck, UserX, X } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.nativeEnum(UserRole, { message: 'Please select a role' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useUsersQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (data: UserFormValues) => {
    // Add passwordHash for the mockDb
    const payload = {
      ...data,
      passwordHash: data.password,
    };
    createUserMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      data: { isActive: !currentStatus },
    });
  };

  // Filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  const columns: ColumnDef[] = [
    {
      header: 'Name',
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Role',
      cell: (row) => <StatusBadge status={row.role} />,
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
            row.isActive
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-900/50 dark:text-slate-600'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created At',
      cell: (row) => <span>{formatDateTime(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.isActive)}
          className={`p-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${
            row.isActive
              ? 'border-black text-black hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900'
              : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/40'
          }`}
          title={row.isActive ? 'Deactivate User' : 'Activate User'}
        >
          {row.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  const filterConfigs = [
    {
      key: 'role',
      label: 'Role',
      options: Object.values(UserRole).map((r) => ({ label: r.replace('_', ' '), value: r })),
    },
  ];

  return (
    <div className="relative">
      <PageHeader
        title="User Management"
        breadcrumbs={[{ label: 'Admin', href: '#' }, { label: 'Users' }]}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add New User
          </button>
        }
      />

      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={(_, val) => setRoleFilter(val)}
        filters={filterConfigs}
        placeholder="Search users by name or email..."
      />

      <DataTable columns={columns} data={filteredUsers} isLoading={isLoading} />

      {/* User Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-default flex justify-between items-center bg-elevated">
              <h3 className="text-lg font-bold text-primary">Create User Profile</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-primary cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">First Name</label>
                  <input
                    type="text"
                    {...register('firstName')}
                    placeholder="Ananya"
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                  {errors.firstName && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName')}
                    placeholder="Sharma"
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                  {errors.lastName && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                />
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Role</label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select role</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.PROCUREMENT_OFFICER}>Procurement Officer</option>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.VENDOR}>Vendor</option>
                </select>
                {errors.role && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.role.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded border border-default text-primary hover:bg-primary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
