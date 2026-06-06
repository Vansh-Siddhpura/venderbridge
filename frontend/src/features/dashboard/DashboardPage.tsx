import { useNavigate } from 'react-router-dom';
import { useDashboardQuery } from './hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, StatCard, DataTable, StatusBadge } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { CheckSquare, FileText, ShoppingCart, Receipt, PlusCircle, Building2, UserPlus, FileSpreadsheet } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin, isProcurementOfficer, isVendor } = useAuth();
  
  const { data, isLoading } = useDashboardQuery();

  const { stats, recentRFQs = [], recentInvoices = [] } = data || {};

  const handleRfqClick = (row: any) => {
    navigate(`/rfqs/${row.id}`);
  };

  const handleInvoiceClick = (row: any) => {
    navigate(`/invoices/${row.id}`);
  };

  const rfqColumns: ColumnDef[] = [
    {
      header: 'RFQ Ref',
      cell: (row) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.rfqNumber}</span>,
    },
    { header: 'Title', accessorKey: 'title' },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Deadline',
      cell: (row) => <span>{formatDate(row.deadline)}</span>,
    },
  ];

  const invoiceColumns: ColumnDef[] = [
    {
      header: 'Invoice No',
      cell: (row) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.invoiceNumber}</span>,
    },
    { header: 'Vendor', accessorKey: 'vendorName' },
    {
      header: 'Amount',
      cell: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dashboard`}
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      {/* Overview stats cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-surface border border-default rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Approvals"
            value={stats?.pendingApprovals ?? 0}
            icon={CheckSquare}
            trend={{ value: '+4%', direction: 'up' }}
          />
          <StatCard
            label="Active RFQs"
            value={stats?.activeRFQs ?? 0}
            icon={FileText}
            trend={{ value: 'Stable', direction: 'up' }}
          />
          <StatCard
            label="Purchase Orders"
            value={stats?.posThisMonth ?? 0}
            icon={ShoppingCart}
            trend={{ value: '+12%', direction: 'up' }}
          />
          <StatCard
            label="Invoices Outstanding"
            value={formatCurrency(stats?.invoicesOutstanding ?? 0)}
            icon={Receipt}
            trend={{ value: '-8%', direction: 'down' }}
          />
        </div>
      )}

      {/* Role based Quick Action panel */}
      <div className="glass-panel rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-extrabold text-primary uppercase tracking-widest border-b border-default pb-3">
          Procurement Quick Console
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(isProcurementOfficer || isAdmin) && (
            <button
              onClick={() => navigate('/rfqs/new')}
              className="p-5 glass-card text-left flex flex-col gap-3 group"
            >
              <PlusCircle size={28} className="text-primary group-hover:scale-110 group-hover:text-purple-500 transition-all" />
              <div>
                <span className="text-sm font-bold text-primary block">New RFQ Sheet</span>
                <span className="text-[11px] text-muted block mt-1">Publish new material bids</span>
              </div>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('/vendors/new')}
              className="p-5 glass-card text-left flex flex-col gap-3 group"
            >
              <Building2 size={28} className="text-primary group-hover:scale-110 group-hover:text-purple-500 transition-all" />
              <div>
                <span className="text-sm font-bold text-primary block">Register Vendor</span>
                <span className="text-[11px] text-muted block mt-1">Onboard business vendors</span>
              </div>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/users')}
              className="p-5 glass-card text-left flex flex-col gap-3 group"
            >
              <UserPlus size={28} className="text-primary group-hover:scale-110 group-hover:text-purple-500 transition-all" />
              <div>
                <span className="text-sm font-bold text-primary block">Create User</span>
                <span className="text-[11px] text-muted block mt-1">Setup staff role access</span>
              </div>
            </button>
          )}
          {isVendor && (
            <button
              onClick={() => navigate('/rfqs')}
              className="p-5 glass-card text-left flex flex-col gap-3 group"
            >
              <FileSpreadsheet size={28} className="text-primary group-hover:scale-110 group-hover:text-purple-500 transition-all" />
              <div>
                <span className="text-sm font-bold text-primary block">Submit Bids</span>
                <span className="text-[11px] text-muted block mt-1">Quote pricing on assignments</span>
              </div>
            </button>
          )}
          {/* All users shortcut */}
          <button
            onClick={() => navigate('/purchase-orders')}
            className="p-5 glass-card text-left flex flex-col gap-3 group"
          >
            <ShoppingCart size={28} className="text-primary group-hover:scale-110 group-hover:text-purple-500 transition-all" />
            <div>
              <span className="text-sm font-bold text-primary block">PO Catalog</span>
              <span className="text-[11px] text-muted block mt-1">View purchase orders list</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity lists grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <FileText size={16} /> Recent Request for Quotations (RFQs)
          </h3>
          <DataTable
            columns={rfqColumns}
            data={recentRFQs}
            isLoading={isLoading}
            onRowClick={handleRfqClick}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
            <Receipt size={16} /> Recent Vendor Invoices
          </h3>
          <DataTable
            columns={invoiceColumns}
            data={recentInvoices}
            isLoading={isLoading}
            onRowClick={handleInvoiceClick}
          />
        </div>
      </div>
    </div>
  );
}
