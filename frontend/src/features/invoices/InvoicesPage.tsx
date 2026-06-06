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
      header: 'Invoice Number',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {row.invoiceNumber}
        </span>
      ),
    },
    { header: 'Vendor Name', accessorKey: 'vendorName' },
    {
      header: 'PO Reference',
      cell: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.poNumber}</span>,
    },
    {
      header: 'Total Value',
      cell: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Due Date',
      cell: (row) => <span>{formatDate(row.dueDate)}</span>,
    },
    {
      header: 'Created At',
      cell: (row) => <span>{formatDate(row.createdAt)}</span>,
    },
  ];

  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: Object.values(InvoiceStatus).map((s) => ({ label: s, value: s })),
    },
  ];

  const handleRowClick = (row: any) => {
    navigate(`/invoices/${row.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Invoices Ledger"
        breadcrumbs={[{ label: 'Procurement', href: '#' }, { label: 'Invoices' }]}
      />

      <SearchFilter
        onSearch={() => {}} // Search placeholder
        onFilter={(_, val) => setStatusFilter(val)}
        filters={filterConfigs}
        placeholder="Search invoices..."
      />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
