import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRFQsQuery } from './hooks/useRFQs';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, DataTable, StatusBadge, SearchFilter } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { RFQStatus } from '@/types/enums';
import { formatDate } from '@/utils/formatters';
import { Plus } from 'lucide-react';

export default function RFQsPage() {
  const navigate = useNavigate();
  const { isProcurementOfficer, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: rfqs = [], isLoading } = useRFQsQuery({
    search: searchTerm,
    status: statusFilter,
  });

  const columns: ColumnDef[] = [
    {
      header: 'RFQ Number',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {row.rfqNumber}
        </span>
      ),
    },
    {
      header: 'Title',
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.title}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Deadline',
      cell: (row) => <span>{formatDate(row.deadline)}</span>,
    },
    { header: 'Created By', accessorKey: 'creatorName' },
    {
      header: 'Created At',
      cell: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(RFQStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  const handleRowClick = (row: any) => {
    navigate(`/rfqs/${row.id}`);
  };

  const showCreateBtn = isProcurementOfficer || isAdmin;

  return (
    <div>
      <PageHeader
        title="Request for Quotations"
        breadcrumbs={[{ label: 'Procurement', href: '#' }, { label: 'RFQs' }]}
        action={
          showCreateBtn ? (
            <button
              onClick={() => navigate('/rfqs/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              New RFQ
            </button>
          ) : undefined
        }
      />

      <SearchFilter
        onSearch={setSearchTerm}
        onFilter={(_, val) => setStatusFilter(val)}
        filters={filterConfigs}
        placeholder="Search RFQs by title or RFQ number..."
      />

      <DataTable
        columns={columns}
        data={rfqs}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
