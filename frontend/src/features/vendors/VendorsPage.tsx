import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorsQuery } from './hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, DataTable, StatusBadge, SearchFilter } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { VendorStatus } from '@/types/enums';
import { Plus, Star } from 'lucide-react';

export default function VendorsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: vendors = [], isLoading } = useVendorsQuery({
    search: searchTerm,
    status: statusFilter,
  });

  const columns: ColumnDef[] = [
    {
      header: 'Company',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.name}</div>
          {row.contactPerson && <div className="text-xs text-muted">{row.contactPerson}</div>}
        </div>
      ),
    },
    {
      header: 'Email',
      cell: (row) => <span className="text-secondary">{row.email}</span>,
    },
    {
      header: 'Category',
      cell: (row) => row.category
        ? <span className="text-secondary">{row.category}</span>
        : <span className="text-muted">Uncategorised</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Rating',
      align: 'right',
      cell: (row) => (
        <div className="inline-flex items-center gap-1 tabular-nums">
          <Star size={13} className="text-warning" fill="currentColor" />
          <span className="font-medium">{row.rating ? Number(row.rating).toFixed(1) : '—'}</span>
        </div>
      ),
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(VendorStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage approved vendors and review pending applications."
        breadcrumbs={[{ label: 'Procurement' }, { label: 'Vendors' }]}
        action={
          isAdmin ? (
            <button
              type="button"
              onClick={() => navigate('/vendors/new')}
              className="btn btn--primary"
            >
              <Plus size={16} />
              Add vendor
            </button>
          ) : undefined
        }
      />

      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={(key, val) => {
          if (key === 'status') setStatusFilter(val);
        }}
        filters={filterConfigs}
        placeholder="Search by company, contact, or email"
      />

      <DataTable
        columns={columns}
        data={vendors}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/vendors/${row.id}`)}
        emptyMessage="No vendors match these filters."
      />
    </div>
  );
}
