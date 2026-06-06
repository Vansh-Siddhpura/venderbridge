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
      header: 'RFQ',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.rfqNumber}</div>
          <div className="text-xs text-muted">{row.title}</div>
        </div>
      ),
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Deadline',
      cell: (row) =>
        row.deadline ? <span className="text-secondary">{formatDate(row.deadline)}</span> : <span className="text-muted">—</span>,
    },
    {
      header: 'Created by',
      cell: (row) => <span className="text-secondary">{row.creatorName ?? '—'}</span>,
    },
    {
      header: 'Created',
      cell: (row) => <span className="text-secondary">{formatDate(row.createdAt)}</span>,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(RFQStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  const showCreate = isProcurementOfficer || isAdmin;

  return (
    <div>
      <PageHeader
        title="Requests for quotation"
        subtitle="Track the lifecycle of every RFQ from draft to award."
        breadcrumbs={[{ label: 'Procurement' }, { label: 'RFQs' }]}
        action={
          showCreate ? (
            <button
              type="button"
              onClick={() => navigate('/rfqs/new')}
              className="btn btn--primary"
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
        placeholder="Search by title or RFQ number"
      />

      <DataTable
        columns={columns}
        data={rfqs}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/rfqs/${row.id}`)}
        emptyMessage="No RFQs match these filters."
      />
    </div>
  );
}
