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
  role: z.enum(['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER'], {
    message: 'Please select a role',
  }),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a digit'),
});

type UserFormValues = z.infer<typeof userSchema>;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  PROCUREMENT_OFFICER: 'Procurement officer',
  MANAGER: 'Manager',
  VENDOR: 'Vendor',
  VIEWER: 'Viewer',
};

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
    createUserMutation.mutate(data as any, {
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
        <div>
          <div className="font-medium text-primary">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-xs text-muted">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => <span className="text-secondary">{ROLE_LABELS[row.role] ?? row.role}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      header: 'Last login',
      cell: (row) =>
        row.lastLoginAt ? (
          <span className="text-secondary">{formatDateTime(row.lastLoginAt)}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row.id, row.isActive)}
          className="btn btn--secondary btn--sm"
          title={row.isActive ? 'Deactivate user' : 'Activate user'}
        >
          {row.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  const filterConfigs = [
    {
      key: 'role',
      label: 'Role',
      options: Object.values(UserRole)
        .filter((r) => r !== UserRole.VIEWER)
        .map((r) => ({ label: ROLE_LABELS[r] ?? r, value: r })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Provision admins, managers, officers and vendor accounts."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        action={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn btn--primary"
          >
            <UserPlus size={16} />
            Add user
          </button>
        }
      />

      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={(_, val) => setRoleFilter(val)}
        filters={filterConfigs}
        placeholder="Search by name or email"
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        emptyMessage="No users match these filters."
      />

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="text-base font-semibold text-primary">Create user</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="app-shell__icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal__body grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="input-label" htmlFor="firstName">First name</label>
                  <input id="firstName" type="text" {...register('firstName')} className="input" placeholder="Ananya" />
                  {errors.firstName && <span className="input-error">{errors.firstName.message}</span>}
                </div>
                <div>
                  <label className="input-label" htmlFor="lastName">Last name</label>
                  <input id="lastName" type="text" {...register('lastName')} className="input" placeholder="Sharma" />
                  {errors.lastName && <span className="input-error">{errors.lastName.message}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="input-label" htmlFor="email">Email</label>
                  <input id="email" type="email" {...register('email')} className="input" placeholder="name@company.com" />
                  {errors.email && <span className="input-error">{errors.email.message}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="input-label" htmlFor="password">Temporary password</label>
                  <input id="password" type="password" {...register('password')} className="input" placeholder="At least 8 chars, 1 uppercase, 1 digit" />
                  {errors.password && <span className="input-error">{errors.password.message}</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="input-label" htmlFor="role">Role</label>
                  <select id="role" {...register('role')} className="input" defaultValue="">
                    <option value="">Select role</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="PROCUREMENT_OFFICER">Procurement officer</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                  {errors.role && <span className="input-error">{errors.role.message}</span>}
                </div>
              </div>
              <div className="modal__footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="btn btn--primary"
                >
                  {createUserMutation.isPending ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
