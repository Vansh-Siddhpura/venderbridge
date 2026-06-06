import { useState } from 'react';
import {
  useQuotationsQuery,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
} from '@/features/quotations/hooks/useQuotations';
import { PageHeader, DataTable } from '@/components/shared';
import type { ColumnDef } from '@/components/shared/DataTable';
import { QuotationStatus } from '@/types/enums';
import { formatCurrency } from '@/utils/formatters';
import { Check, X as XIcon, ListChecks } from 'lucide-react';

export default function ApprovalsPage() {
  const { data: quotations = [], isLoading } = useQuotationsQuery({});

  const approveMutation = useApproveQuotationMutation();
  const rejectMutation = useRejectQuotationMutation();

  const [selectedQte, setSelectedQte] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const pendingQuotes = quotations.filter((q: any) => q.status === QuotationStatus.SUBMITTED);

  const isCheapestForRfq = (qte: any) => {
    const siblings = quotations.filter((q: any) => q.rfqId === qte.rfqId);
    if (siblings.length <= 1) return true;
    const minPrice = Math.min(...siblings.map((s: any) => s.totalAmount));
    return qte.totalAmount <= minPrice;
  };

  const openModal = (qte: any, type: 'approve' | 'reject') => {
    setSelectedQte(qte);
    setActionType(type);
    setRemarks('');
    setIsConfirmOpen(true);
  };

  const submitDecision = () => {
    if (remarks.length < 10) return;
    const mutation = actionType === 'approve' ? approveMutation : rejectMutation;
    mutation.mutate(
      { id: selectedQte.id, comments: remarks },
      {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setSelectedQte(null);
        },
      }
    );
  };

  const columns: ColumnDef[] = [
    {
      header: 'Quotation',
      cell: (row) => (
        <div>
          <div className="font-medium text-primary">{row.quotationNumber}</div>
          <div className="text-xs text-muted">{row.vendorName ?? '—'}</div>
        </div>
      ),
    },
    {
      header: 'RFQ',
      cell: (row) => <span className="text-secondary">{row.rfqTitle ?? row.rfqId?.slice(0, 8) ?? '—'}</span>,
    },
    {
      header: 'Bid',
      align: 'right',
      cell: (row) => <span className="font-medium tabular-nums">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Competitiveness',
      cell: (row) => {
        const cheapest = isCheapestForRfq(row);
        return (
          <span
            className={`badge badge--${cheapest ? 'info' : 'neutral'}`}
          >
            {cheapest ? 'Lowest bid' : 'Higher bid'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openModal(row, 'approve')}
            className="btn btn--primary btn--sm"
            title="Approve quotation"
          >
            <Check size={13} />
            Approve
          </button>
          <button
            type="button"
            onClick={() => openModal(row, 'reject')}
            className="btn btn--secondary btn--sm"
            title="Reject quotation"
          >
            <XIcon size={13} />
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pending approvals"
        subtitle={`${pendingQuotes.length} quotation${pendingQuotes.length === 1 ? '' : 's'} awaiting review.`}
        breadcrumbs={[{ label: 'Procurement' }, { label: 'Approvals' }]}
        action={
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <ListChecks size={16} /> {pendingQuotes.length} pending
          </span>
        }
      />

      <DataTable
        columns={columns}
        data={pendingQuotes}
        isLoading={isLoading}
        emptyMessage="No quotations waiting for approval."
      />

      {isConfirmOpen && selectedQte && (
        <div className="modal-backdrop" onClick={() => setIsConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="text-base font-semibold text-primary">
                {actionType === 'approve' ? 'Approve quotation' : 'Reject quotation'}
              </h3>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="app-shell__icon-btn"
                aria-label="Close"
              >
                <XIcon size={18} />
              </button>
            </div>
            <div className="modal__body space-y-4">
              <div className="rounded-md border border-default bg-elevated p-3 text-xs leading-relaxed text-secondary">
                <div><strong>Quote:</strong> {selectedQte.quotationNumber}</div>
                <div><strong>Vendor:</strong> {selectedQte.vendorName ?? '—'}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedQte.totalAmount)}</div>
                <div><strong>Comparison:</strong> {isCheapestForRfq(selectedQte) ? 'Lowest bid for this RFQ' : 'Higher than another submission'}</div>
              </div>
              <div>
                <label className="input-label" htmlFor="remarks">
                  Decision remarks <span className="text-muted">(min 10 characters)</span>
                </label>
                <textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  placeholder="Explain the decision: pricing, delivery time, vendor track record…"
                  className="input"
                />
                <span className="input-help">{remarks.length} characters</span>
              </div>
            </div>
            <div className="modal__footer">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="btn btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={remarks.length < 10 || approveMutation.isPending || rejectMutation.isPending}
                className={`btn ${actionType === 'approve' ? 'btn--primary' : 'btn--danger'}`}
              >
                {actionType === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
