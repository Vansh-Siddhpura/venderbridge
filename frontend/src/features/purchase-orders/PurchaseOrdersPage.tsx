import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOsQuery } from './hooks/usePurchaseOrders';
import { PageHeader, DataTable, StatusBadge, SearchFilter } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { POStatus } from '@/types/enums';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function PurchaseOrdersPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: pos = [], isLoading } = usePOsQuery({
    status: statusFilter as POStatus,
  });

  const columns: ColumnDef[] = [
    {
      header: 'PO',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.poNumber}</div>
          <div className="text-xs text-muted">{row.vendorName ?? '—'}</div>
        </div>
      ),
    },
    {
      header: 'Total',
      align: 'right',
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.totalAmount)}</span>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Expected delivery',
      cell: (row) =>
        row.expectedDelivery ? (
          <span className="text-secondary">{formatDate(row.expectedDelivery)}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
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
      options: Object.values(POStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Purchase orders"
        subtitle="Track delivery and fulfillment of every issued PO."
        breadcrumbs={[{ label: 'Procurement' }, { label: 'Purchase orders' }]}
      />

      <SearchFilter
        onSearch={() => {}}
        onFilter={(_, val) => setStatusFilter(val)}
        filters={filterConfigs}
        placeholder="Search purchase orders"
      />

      <DataTable
        columns={columns}
        data={pos}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
        emptyMessage="No purchase orders yet."
      />
    </div>
  );
}
