import { useNavigate } from 'react-router-dom';
import { useDashboardQuery } from './hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, StatCard, DataTable, StatusBadge } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  ClipboardCheck,
  FileText,
  ShoppingCart,
  Receipt,
  Plus,
  Building2,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isProcurementOfficer, isVendor } = useAuth();
  const { data, isLoading } = useDashboardQuery();

  const { stats, recentRFQs = [], recentInvoices = [] } = data || {};

  const rfqColumns: ColumnDef[] = [
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
      cell: (row) => row.deadline ? <span className="text-secondary">{formatDate(row.deadline)}</span> : <span className="text-muted">—</span>,
    },
  ];

  const invoiceColumns: ColumnDef[] = [
    {
      header: 'Invoice',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.invoiceNumber}</div>
          <div className="text-xs text-muted">{row.vendorName}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      align: 'right',
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.totalAmount)}</span>,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const quickActions: Array<{ label: string; description: string; icon: typeof Plus; path: string; show: boolean }> = [
    {
      label: 'Create RFQ',
      description: 'Publish a new request for quotation',
      icon: Plus,
      path: '/rfqs/new',
      show: !!(isProcurementOfficer || isAdmin),
    },
    {
      label: 'Add vendor',
      description: 'Onboard a new vendor to the registry',
      icon: Building2,
      path: '/vendors/new',
      show: !!isAdmin,
    },
    {
      label: 'Invite a team member',
      description: 'Add officers or managers to the workspace',
      icon: UserPlus,
      path: '/admin/users',
      show: !!isAdmin,
    },
    {
      label: isVendor ? 'Submit a bid' : 'Browse purchase orders',
      description: isVendor
        ? 'Quote on RFQs you were invited to'
        : 'Review issued purchase orders and statuses',
      icon: isVendor ? FileText : ShoppingCart,
      path: isVendor ? '/rfqs' : '/purchase-orders',
      show: true,
    },
  ];

  const visibleActions = quickActions.filter((a) => a.show);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}`}
        subtitle="Here's an overview of your procurement activity."
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="card card__body">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton mt-3 h-8 w-1/2" />
              <div className="skeleton mt-3 h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Pending approvals"
            value={stats?.pendingApprovals ?? 0}
            icon={ClipboardCheck}
            hint="Quotations awaiting review"
          />
          <StatCard
            label="Active RFQs"
            value={stats?.activeRFQs ?? 0}
            icon={FileText}
            hint="Published &amp; accepting bids"
          />
          <StatCard
            label="POs this month"
            value={stats?.posThisMonth ?? 0}
            icon={ShoppingCart}
            hint="Issued in the current month"
          />
          <StatCard
            label="Outstanding invoices"
            value={formatCurrency(stats?.invoicesOutstanding ?? 0)}
            icon={Receipt}
            hint="Unpaid or overdue"
          />
        </div>
      )}

      {visibleActions.length > 0 && (
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Quick actions</h2>
              <p className="mt-1 text-xs text-muted">Shortcuts to the most common procurement tasks.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2 lg:grid-cols-4">
            {visibleActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start gap-2 rounded-lg border border-default bg-elevated p-4 text-left transition hover:border-strong hover:bg-muted"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-light text-brand">
                  <action.icon size={18} />
                </span>
                <span className="text-sm font-semibold text-primary">{action.label}</span>
                <span className="text-xs text-muted">{action.description}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand">
                  Open <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Recent RFQs</h2>
            <button
              type="button"
              onClick={() => navigate('/rfqs')}
              className="btn btn--ghost btn--sm"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <DataTable
            columns={rfqColumns}
            data={recentRFQs}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/rfqs/${row.id}`)}
            emptyMessage="No RFQs yet."
          />
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Recent invoices</h2>
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="btn btn--ghost btn--sm"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>
          <DataTable
            columns={invoiceColumns}
            data={recentInvoices}
            isLoading={isLoading}
            onRowClick={(row) => navigate(`/invoices/${row.id}`)}
            emptyMessage="No invoices yet."
          />
        </section>
      </div>
    </div>
  );
}
