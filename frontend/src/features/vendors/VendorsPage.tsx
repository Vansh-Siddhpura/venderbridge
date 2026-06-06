import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorsQuery } from './hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, DataTable, StatusBadge, SearchFilter } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { VendorStatus } from '@/types/enums';
import { Plus } from 'lucide-react';

export default function VendorsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: vendors = [], isLoading } = useVendorsQuery({
    search: searchTerm,
    status: statusFilter,
    category: categoryFilter,
  });

  const columns: ColumnDef[] = [
    {
      header: 'Company Name',
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.name}
        </span>
      ),
    },
    { header: 'Contact Person', accessorKey: 'contactPerson' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Category', accessorKey: 'category' },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Rating',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {row.rating ? row.rating.toFixed(1) : '0.0'}
          </span>
          <span className="text-blue-500">★</span>
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
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'IT Hardware & Networking', value: 'IT Hardware & Networking' },
        { label: 'Logistics & Shipping', value: 'Logistics & Shipping' },
        { label: 'Office Stationery', value: 'Office Stationery' },
        { label: 'Raw Materials & Steel', value: 'Raw Materials & Steel' },
        { label: 'Facilities Maintenance', value: 'Facilities Maintenance' },
      ],
    },
  ];

  const handleRowClick = (row: any) => {
    navigate(`/vendors/${row.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Vendors Registry"
        breadcrumbs={[{ label: 'Procurement', href: '#' }, { label: 'Vendors' }]}
        action={
          isAdmin ? (
            <button
              onClick={() => navigate('/vendors/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              Add Vendor
            </button>
          ) : undefined
        }
      />

      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={(key, val) => {
          if (key === 'status') setStatusFilter(val);
          if (key === 'category') setCategoryFilter(val);
        }}
        filters={filterConfigs}
        placeholder="Search vendors by name, contact, email..."
      />

      <DataTable
        columns={columns}
        data={vendors}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
