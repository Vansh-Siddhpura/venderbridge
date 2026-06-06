import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoicesQuery } from './hooks/useInvoices';
import { PageHeader, DataTable, StatusBadge, SearchFilter } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { InvoiceStatus } from '@/types/enums';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: invoices = [], isLoading } = useInvoicesQuery({
    status: statusFilter as InvoiceStatus,
  });

  const columns: ColumnDef[] = [
    {
      header: 'Invoice',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.invoiceNumber}</div>
          <div className="text-xs text-muted">{row.vendorName ?? '—'}</div>
        </div>
      ),
    },
    {
      header: 'PO reference',
      cell: (row) => row.poNumber ? <span className="text-secondary">{row.poNumber}</span> : <span className="text-muted">—</span>,
    },
    {
      header: 'Amount',
      align: 'right',
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.totalAmount)}</span>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Due date',
      cell: (row) =>
        row.dueDate ? <span className="text-secondary">{formatDate(row.dueDate)}</span> : <span className="text-muted">—</span>,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(InvoiceStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Monitor billing status and outstanding balances."
        breadcrumbs={[{ label: 'Procurement' }, { label: 'Invoices' }]}
      />

      <SearchFilter
        onSearch={() => {}}
        onFilter={(_, val) => setStatusFilter(val)}
        filters={filterConfigs}
        placeholder="Search invoices"
      />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        emptyMessage="No invoices yet."
      />
    </div>
  );
}
