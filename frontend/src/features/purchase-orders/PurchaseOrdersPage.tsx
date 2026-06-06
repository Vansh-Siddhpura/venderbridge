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
      header: 'PO Number',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {row.poNumber}
        </span>
      ),
    },
    { header: 'Vendor Name', accessorKey: 'vendorName' },
    {
      header: 'Total Value',
      cell: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Expected Delivery',
      cell: (row) => <span>{formatDate(row.expectedDelivery)}</span>,
    },
    {
      header: 'Issued At',
      cell: (row) => <span>{row.issuedAt ? formatDate(row.issuedAt) : '-'}</span>,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(POStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  const handleRowClick = (row: any) => {
    navigate(`/purchase-orders/${row.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Purchase Orders Ledger"
        breadcrumbs={[{ label: 'Procurement', href: '#' }, { label: 'Purchase Orders' }]}
      />

      <SearchFilter
        onSearch={() => {}} // Simple search placeholder
        onFilter={(_, val) => setStatusFilter(val)}
        filters={filterConfigs}
        placeholder="Search purchase orders..."
      />

      <DataTable
        columns={columns}
        data={pos}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
