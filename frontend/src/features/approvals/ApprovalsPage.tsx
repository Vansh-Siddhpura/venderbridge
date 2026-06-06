import { useState } from 'react';
import { useQuotationsQuery, useApproveQuotationMutation, useRejectQuotationMutation } from '@/features/quotations/hooks/useQuotations';
import { getApprovals } from '@/api/api';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, DataTable, Timeline } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { QuotationStatus, ApprovalAction } from '@/types/enums';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle, XCircle, MessageSquare, ListTodo } from 'lucide-react';

export default function ApprovalsPage() {
  
  // Queries
  const { data: quotations = [], isLoading: qteLoading } = useQuotationsQuery({});
  const { data: approvals = [], refetch: refetchApprovals } = useQuery({
    queryKey: ['approvals'],
    queryFn: getApprovals,
  });

  // Mutations
  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();

  // States
  const [selectedQte, setSelectedQte] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Filter pending quotes (role based, managers review SUBMITTED/UNDER_REVIEW)
  const pendingQuotes = quotations.filter((q) => q.status === QuotationStatus.SUBMITTED);

  // Helper: check if this quote is the cheapest among other submissions for the same RFQ
  const isCheapestForRfq = (qte: any) => {
    const siblingQuotes = quotations.filter((q) => q.rfqId === qte.rfqId);
    if (siblingQuotes.length <= 1) return true;
    const minPrice = Math.min(...siblingQuotes.map((s) => s.totalAmount));
    return qte.totalAmount <= minPrice;
  };

  const handleActionClick = (qte: any, type: 'approve' | 'reject') => {
    setSelectedQte(qte);
    setActionType(type);
    setRemarks('');
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (remarks.length < 10) return;
    const mutation = actionType === 'approve' ? approveMutation : rejectMutation;
    mutation.mutate(
      { id: selectedQte.id, comments: remarks },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setSelectedQte(null);
          refetchApprovals();
        },
      }
    );
  };

  const columns: ColumnDef[] = [
    {
      header: 'Quote Number',
      cell: (row) => <span className="font-bold text-slate-900 dark:text-slate-100">{row.quotationNumber}</span>,
    },
    { header: 'Vendor', accessorKey: 'vendorName' },
    {
      header: 'RFQ Ref',
      cell: (row) => <span className="font-medium text-slate-800 dark:text-slate-200">{row.rfqTitle}</span>,
    },
    {
      header: 'Bid Amount',
      cell: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Comparison Context',
      cell: (row) => {
        const cheapest = isCheapestForRfq(row);
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              cheapest
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400'
              }`}
          >
            {cheapest ? 'Lowest Bid Price' : 'Higher Bid Price'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleActionClick(row, 'approve')}
            className="p-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300 cursor-pointer"
            title="Approve & Generate PO"
          >
            <CheckCircle size={15} />
          </button>
          <button
            onClick={() => handleActionClick(row, 'reject')}
            className="p-1 rounded bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 cursor-pointer"
            title="Reject Quote"
          >
            <XCircle size={15} />
          </button>
        </div>
      ),
    },
  ];

  // Map approvals data to Timeline structure
  const timelineEvents = approvals.map((app: any) => ({
    id: app.id,
    title: app.action === ApprovalAction.APPROVED ? 'Approved Quotation' : 'Rejected Quotation',
    description: `Decision comments: "${app.comments || 'No remarks provided'}"`,
    timestamp: app.actedAt || app.createdAt,
    user: `${app.userName} (${app.userRole})`,
    icon: app.action === ApprovalAction.APPROVED ? '✓' : '✗',
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Approvals Hub"
        breadcrumbs={[{ label: 'Procurement', href: '#' }, { label: 'Approvals' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending approvals table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wide flex items-center gap-1.5">
            <ListTodo size={18} className="text-primary" />
            Quotations Pending Approval ({pendingQuotes.length})
          </h3>
          <DataTable
            columns={columns}
            data={pendingQuotes}
            isLoading={qteLoading}
          />
        </div>

        {/* Audit approvals history timeline */}
        <div className="bg-surface border border-default rounded-lg p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default mb-4">
            Approvals Audit Log
          </h3>
          <Timeline events={timelineEvents} />
        </div>
      </div>

      {/* Decision Remarks Dialog Drawer */}
      {isConfirmOpen && selectedQte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-default bg-elevated">
              <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
                <MessageSquare size={18} className="text-primary" />
                {actionType === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs space-y-1 bg-elevated/20 p-3 rounded-md border border-default">
                <p className="text-primary">
                  <strong>Quote:</strong> {selectedQte.quotationNumber}
                </p>
                <p className="text-primary">
                  <strong>Vendor:</strong> {selectedQte.vendorName}
                </p>
                <p className="text-primary">
                  <strong>Total Value:</strong> {formatCurrency(selectedQte.totalAmount)}
                </p>
                <p className="text-primary">
                  <strong>Comparison:</strong> {isCheapestForRfq(selectedQte) ? 'Lowest Bid Price' : 'Higher Bid Price'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Evaluation Remarks * (Min 10 characters)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Justify selection, delivery speed or pricing comparison details..."
                  className="w-full px-3 py-2 text-xs rounded bg-surface border border-default text-primary focus:outline-none resize-none"
                />
                <p className="text-[10px] text-muted mt-1">
                  Characters: {remarks.length} (At least 10 required)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-default text-primary hover:bg-primary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={remarks.length < 10 || approveMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
