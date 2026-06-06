import { useReportsQuery } from './hooks/useReports';
import { PageHeader, DataTable, LoadingSkeleton, EmptyState } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { formatCurrency } from '@/utils/formatters';
import { Download, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const PALETTE = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const { data, isLoading } = useReportsQuery();

  const categorySpend: Array<{ categoryName: string; amount: number }> = data?.categorySpend ?? [];

  const totalSpend = categorySpend.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const handleExportCSV = () => {
    if (categorySpend.length === 0) {
      toast.error('Nothing to export yet.');
      return;
    }
    const headers = ['Category', 'Total spend (INR)'];
    const rows = categorySpend.map((c) => [`"${(c.categoryName ?? '').replace(/"/g, '""')}"`, c.amount]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `category_spend_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Exported category spend to CSV.');
  };

  if (isLoading) return <LoadingSkeleton type="detail" />;

  const columns: ColumnDef[] = [
    {
      header: 'Category',
      cell: (row) => <span className="font-medium text-primary">{row.categoryName}</span>,
    },
    {
      header: 'Total spend',
      align: 'right',
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(Number(row.amount))}</span>,
    },
    {
      header: 'Share',
      align: 'right',
      cell: (row) => {
        const pct = totalSpend > 0 ? ((Number(row.amount) / totalSpend) * 100).toFixed(1) : '0.0';
        return <span className="tabular-nums text-secondary">{pct}%</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports &amp; analytics"
        subtitle="Procurement spend insights, segmented by vendor category."
        breadcrumbs={[{ label: 'Insights' }, { label: 'Reports' }]}
        action={
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn--secondary"
          >
            <Download size={16} />
            Export CSV
          </button>
        }
      />

      {categorySpend.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No spend data yet"
          description="Once purchase orders are issued, spend analytics will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="card__header">
              <h2 className="card__title">Spend by category</h2>
            </div>
            <div className="card__body">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySpend} margin={{ top: 10, right: 24, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                    <XAxis dataKey="categoryName" stroke="var(--text-muted)" fontSize={12} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h2 className="card__title flex items-center gap-2"><PieChartIcon size={16} className="text-brand" /> Distribution</h2>
            </div>
            <div className="card__body">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categorySpend}
                      dataKey="amount"
                      nameKey="categoryName"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categorySpend.map((_, idx) => (
                        <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                      }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card lg:col-span-3">
            <div className="card__header">
              <h2 className="card__title">Detailed category spend</h2>
            </div>
            <DataTable columns={columns} data={categorySpend} isLoading={false} emptyMessage="No spend recorded." />
          </div>
        </div>
      )}
    </div>
  );
}
