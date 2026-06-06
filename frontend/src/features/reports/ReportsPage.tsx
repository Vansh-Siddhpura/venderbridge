import { useReportsQuery } from './hooks/useReports';
import { PageHeader, DataTable, LoadingSkeleton } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { formatCurrency } from '@/utils/formatters';
import { Download, BarChart2, PieChart, TrendingUp, DollarSign } from 'lucide-react';
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
} from 'recharts';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { data, isLoading } = useReportsQuery();

  const handleExportCSV = () => {
    if (!data || !data.vendorPerformance) return;

    const headers = ['Vendor Name', 'RFQs Participated', 'Win Rate %', 'Avg Delivery Days', 'Total Billed (INR)'];
    const rows = data.vendorPerformance.map((v: any) => [
      `"${v.vendorName.replace(/"/g, '""')}"`,
      v.totalRFQsParticipated,
      v.winRate,
      v.avgDeliveryDays,
      v.totalBilled,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Performance matrix exported to CSV!');
  };

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  const { monthlySpending = [], vendorPerformance = [], topVendors = [], rfqStatusBreakdown = [] } = data || {};

  // Strict Blue & Black cell fills for Recharts Pie
  const PIE_COLORS = [
    '#1e3a8a', // Deep Blue
    '#2563eb', // Royal Blue
    '#60a5fa', // Sky Blue
    '#000000', // Black (or slate grey)
  ];

  const columns: ColumnDef[] = [
    {
      header: 'Vendor Name',
      cell: (row) => <span className="font-semibold text-slate-900 dark:text-slate-100">{row.vendorName}</span>,
    },
    { header: 'RFQs Participated', accessorKey: 'totalRFQsParticipated' },
    {
      header: 'Win Rate %',
      cell: (row) => <span className="font-bold">{row.winRate}%</span>,
    },
    {
      header: 'Avg Delivery Speed',
      cell: (row) => <span>{row.avgDeliveryDays} Days</span>,
    },
    {
      header: 'Total Paid Billed',
      cell: (row) => <span className="font-bold">{formatCurrency(row.totalBilled)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Procurement Analytics"
        breadcrumbs={[{ label: 'Admin', href: '#' }, { label: 'Reports' }]}
        action={
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm cursor-pointer flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
        }
      />

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Spend */}
        <div className="bg-surface border border-default p-5 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-default pb-2">
            <DollarSign size={16} className="text-primary" />
            Monthly Procurement Spend (INR)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpending} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis dataKey="month" stroke="currentColor" className="text-[10px] text-muted" />
                <YAxis stroke="currentColor" className="text-[10px] text-muted" />
                <Tooltip
                  contentStyle={{
                    background: '#040814',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#93c5fd',
                  }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: RFQ Status */}
        <div className="bg-surface border border-default p-5 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-default pb-2">
            <PieChart size={16} className="text-primary" />
            RFQ Status Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={rfqStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`}
                >
                  {rfqStatusBreakdown.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#040814',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#93c5fd',
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top 5 Vendors spend */}
        <div className="bg-surface border border-default p-5 rounded-lg shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-default pb-2">
            <TrendingUp size={16} className="text-primary" />
            Top 5 Vendors by Total Spend (INR)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topVendors}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                <XAxis type="number" stroke="currentColor" className="text-[10px] text-muted" />
                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-[10px] text-muted" />
                <Tooltip
                  contentStyle={{
                    background: '#040814',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#93c5fd',
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vendor performance matrix */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wide flex items-center gap-1.5">
          <BarChart2 size={18} className="text-primary" />
          Vendor Performance Matrix
        </h3>
        <DataTable columns={columns} data={vendorPerformance} isLoading={false} />
      </div>
    </div>
  );
}
