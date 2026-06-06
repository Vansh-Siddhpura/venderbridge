import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRFQDetailQuery } from '@/features/rfqs/hooks/useRFQs';
import { useQuotationsQuery, useSubmitQuotationMutation, useApproveQuotationMutation } from './hooks/useQuotations';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge } from '@/components/shared';
import { QuotationStatus } from '@/types/enums';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, TrendingDown, Star, Landmark, Send } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod Schema for Vendor Submission
const submitSchema = z.object({
  deliveryDays: z.number().positive('Delivery days must be positive').int(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      rfqItemId: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit: z.string(),
      unitPrice: z.number().positive('Price must be greater than 0'),
      taxRate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Invalid tax rate'),
    })
  ),
});

type SubmitFormValues = z.infer<typeof submitSchema>;

export default function QuotationComparisonPage() {
  const { id = '' } = useParams<{ id: string }>(); // RFQ ID
  const navigate = useNavigate();
  const { isVendor } = useAuth();

  // Queries
  const { data: rfq, isLoading: rfqLoading } = useRFQDetailQuery(id);
  const { data: quotations = [], isLoading: qteLoading } = useQuotationsQuery({ rfqId: id });

  // Mutations
  const submitQteMutation = useSubmitQuotationMutation();
  const approveQteMutation = useApproveQuotationMutation();

  // Component States
  const [sortBy, setSortBy] = useState<'price' | 'delivery'>('price');
  const [selectedQte, setSelectedQte] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  // ─── VENDOR SUBMISSION VIEW FORM SETUP ──────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    values: rfq
      ? {
          deliveryDays: 7,
          notes: '',
          items: rfq.items.map((item: any) => ({
            rfqItemId: item.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: 0,
            taxRate: 18, // default 18% GST
          })),
        }
      : undefined,
  });

  const { fields } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items') || [];

  // Calculate Running Total
  const runningTotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const tax = Number(item.taxRate) || 0;
    const subtotal = qty * price;
    return sum + subtotal * (1 + tax / 100);
  }, 0);

  const handleVendorSubmit = (data: SubmitFormValues) => {
    const payload = {
      rfqId: id,
      rfqTitle: rfq.title,
      items: data.items,
      deliveryDays: data.deliveryDays,
      notes: data.notes,
      status: QuotationStatus.SUBMITTED,
    };
    submitQteMutation.mutate(payload, {
      onSuccess: () => navigate(`/rfqs/${id}`),
    });
  };

  // ─── OFFICER / MANAGER COMPARISON LOGIC ────────────────────────────────────
  const acceptedQte = quotations.find((q) => q.status === QuotationStatus.SELECTED);

  // Sorting
  const sortedQuotations = [...quotations].sort((a, b) => {
    if (sortBy === 'price') return a.totalAmount - b.totalAmount;
    return a.deliveryDays - b.deliveryDays;
  });

  // Calculate Lowest Price per Item Row
  const getLowestPriceForRfqItem = (rfqItemId: string) => {
    let lowest = Infinity;
    let lowestVendorId = '';
    quotations.forEach((q) => {
      const item = q.items.find((i: any) => i.rfqItemId === rfqItemId);
      if (item && item.unitPrice < lowest) {
        lowest = item.unitPrice;
        lowestVendorId = q.vendorId;
      }
    });
    return { lowest, lowestVendorId };
  };

  const handleSelectWinnerClick = (qte: any) => {
    setSelectedQte(qte);
    setRemarks('');
    setIsApproveModalOpen(true);
  };

  const handleConfirmWinner = () => {
    if (remarks.length < 10) return;
    approveQteMutation.mutate(
      { id: selectedQte.id, comments: remarks },
      {
        onSuccess: () => {
          setIsApproveModalOpen(false);
          setSelectedQte(null);
        },
      }
    );
  };

  if (rfqLoading || qteLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!rfq) {
    return (
      <div className="empty">
        <p className="empty__title">RFQ not found</p>
        <button onClick={() => navigate('/rfqs')} className="btn btn--primary mt-4">
          Back to RFQs
        </button>
      </div>
    );
  }

  // ─── RENDER 1: VENDOR SUBMIT VIEW ──────────────────────────────────────────
  if (isVendor) {
    return (
      <div>
        <PageHeader
          title="Submit Bid Quotation"
          breadcrumbs={[
            { label: 'RFQs', href: '/rfqs' },
            { label: rfq.rfqNumber, href: `/rfqs/${id}` },
            { label: 'Submit Quotation' },
          ]}
          action={
            <button
              onClick={() => navigate(`/rfqs/${id}`)}
              className="btn btn--secondary flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <div className="card__body space-y-6">
            <div>
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default mb-4">
                Line Items Pricing
              </h3>
              
              <form onSubmit={handleSubmit(handleVendorSubmit)} className="space-y-4">
                {fields.map((field, idx) => {
                  const qty = watchedItems[idx]?.quantity || 0;
                  const price = watchedItems[idx]?.unitPrice || 0;
                  const tax = watchedItems[idx]?.taxRate || 0;
                  const lineTotal = qty * price * (1 + tax / 100);

                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 rounded bg-elevated/20 border border-default">
                      <div className="md:col-span-4">
                        <span className="block text-[10px] font-bold text-muted uppercase mb-1">Item Description</span>
                        <span className="text-xs font-semibold text-primary block truncate">{field.description}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-[10px] font-bold text-muted uppercase mb-1">Qty</span>
                        <span className="text-xs text-primary block">{field.quantity} {field.unit}</span>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">Unit Price *</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                          className="input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">GST % *</label>
                        <input
                          type="number"
                          {...register(`items.${idx}.taxRate`, { valueAsNumber: true })}
                          className="input"
                        />
                      </div>
                      <div className="md:col-span-2 text-right">
                        <span className="block text-[10px] font-bold text-muted uppercase mb-1">Line Total</span>
                        <span className="text-xs font-bold text-primary block">{formatCurrency(lineTotal)}</span>
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-default">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">Delivery Time (Days) *</label>
                    <input
                      type="number"
                      {...register('deliveryDays', { valueAsNumber: true })}
                      className="input"
                    />
                    {errors.deliveryDays && (
                      <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.deliveryDays.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">Notes / Terms</label>
                    <textarea
                      {...register('notes')}
                      rows={2}
                      placeholder="Add payment terms, validity or freight terms..."
                      className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-default">
                  <button
                    type="submit"
                    disabled={submitQteMutation.isPending}
                    className="btn btn--primary flex items-center gap-2"
                  >
                    <Send size={16} />
                    Submit Quotation
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>

          <div className="card h-fit">
            <div className="card__body space-y-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
              Quotation Summary
            </h3>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted">Total Bid Value:</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(runningTotal)}</span>
            </div>
            <p className="text-[10px] text-muted italic leading-normal">
              Note: This quotation remains binding until validity terms expire. Changes cannot be made after submission.
            </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER 2: PROCUREMENT / MANAGER COMPARISON VIEW ─────────────────────
  return (
    <div>
      <PageHeader
        title="Quotation Comparison"
        breadcrumbs={[
          { label: 'RFQs', href: '/rfqs' },
          { label: rfq.rfqNumber, href: `/rfqs/${id}` },
          { label: 'Comparison' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted uppercase">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded border border-default bg-surface text-primary font-semibold cursor-pointer"
            >
              <option value="price">Total Price</option>
              <option value="delivery">Delivery Days</option>
            </select>
          </div>
        }
      />

      {acceptedQte && (
        <div className="card mb-6 border-default bg-primary-light">
          <div className="card__body flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-primary">Quotation selected</h4>
            <p className="text-xs text-muted mt-0.5">
              Quotation by <strong>{acceptedQte.vendorName}</strong> has been selected. A purchase order has been generated.
            </p>
          </div>
          <StatusBadge status="SELECTED" />
          </div>
        </div>
      )}

      {quotations.length === 0 ? (
        <div className="empty">
          <p className="empty__description">No bids submitted yet for this RFQ.</p>
        </div>
      ) : (
        <div className="data-table">
          {/* COMPARISON TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-elevated border-b border-default text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-6 py-4 w-[250px] sticky left-0 bg-elevated z-10 border-r border-default">
                    RFQ Items
                  </th>
                  {sortedQuotations.map((q) => (
                    <th key={q.id} className="px-6 py-4 text-center border-r border-default last:border-r-0">
                      <span className="block font-bold text-primary text-sm">{q.vendorName}</span>
                      <span className="block text-[10px] text-muted font-normal mt-1">{q.quotationNumber}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-default text-xs">
                {/* Item Rows */}
                {rfq.items.map((item: any) => {
                  const { lowest, lowestVendorId } = getLowestPriceForRfqItem(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-primary-light/5">
                      <td className="px-6 py-4 font-semibold text-primary sticky left-0 bg-surface border-r border-default">
                        {item.description}
                        <span className="block text-[10px] text-muted font-normal mt-1">
                          Qty: {item.quantity} {item.unit}
                        </span>
                      </td>

                      {sortedQuotations.map((q) => {
                        const qItem = q.items.find((i: any) => i.rfqItemId === item.id);
                        if (!qItem) {
                          return (
                            <td key={q.id} className="px-6 py-4 text-center text-muted border-r border-default last:border-r-0">
                              -
                            </td>
                          );
                        }

                        const isLowest = qItem.unitPrice === lowest && q.vendorId === lowestVendorId;

                        return (
                          <td
                            key={q.id}
                            className={`px-6 py-4 text-center border-r border-default last:border-r-0 ${
                              isLowest ? 'bg-primary-light text-brand' : 'text-primary'
                            }`}
                          >
                            <div className="font-semibold">{formatCurrency(qItem.unitPrice)} / unit</div>
                            <div className="text-[10px] text-muted mt-1">
                              Total: {formatCurrency(qItem.unitPrice * item.quantity)} (GST {qItem.taxRate}%)
                            </div>
                            {isLowest && (
                              <span className="badge badge--info mt-1.5">
                                <TrendingDown size={10} /> Lowest
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Footer Metadata Rows */}
                <tr className="bg-elevated/40 border-t-2 border-default">
                  <td className="px-6 py-4 font-bold text-muted sticky left-0 bg-surface border-r border-default">
                    Lead Delivery Time
                  </td>
                  {sortedQuotations.map((q) => (
                    <td key={q.id} className="px-6 py-4 text-center font-bold text-primary border-r border-default last:border-r-0">
                      {q.deliveryDays} Days
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-6 py-4 font-bold text-muted sticky left-0 bg-surface border-r border-default">
                    Vendor Rating
                  </td>
                  {sortedQuotations.map((q) => {
                    const rating = q.vendorId === 'ven-1' ? 4.8 : q.vendorId === 'ven-2' ? 4.2 : 3.9;
                    return (
                      <td key={q.id} className="px-6 py-4 text-center border-r border-default last:border-r-0">
                        <div className="flex items-center justify-center gap-0.5 text-primary font-bold">
                          <Star size={14} className="fill-current text-brand" />
                          {rating} / 5.0
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-elevated border-t border-default">
                  <td className="px-6 py-4 font-extrabold text-primary sticky left-0 bg-elevated border-r border-default">
                    GRAND TOTAL
                  </td>
                  {sortedQuotations.map((q) => (
                    <td key={q.id} className="px-6 py-4 text-center text-sm font-extrabold text-primary border-r border-default last:border-r-0">
                      {formatCurrency(q.totalAmount)}
                    </td>
                  ))}
                </tr>

                {/* Actions Footer */}
                {!acceptedQte && (
                  <tr className="bg-surface border-t border-default">
                    <td className="px-6 py-4 sticky left-0 bg-surface border-r border-default" />
                    {sortedQuotations.map((q) => (
                      <td key={q.id} className="px-6 py-4 text-center border-r border-default last:border-r-0">
                        <button
                          onClick={() => handleSelectWinnerClick(q)}
                          className="btn btn--primary btn--sm uppercase tracking-wider"
                        >
                          Select Vendor
                        </button>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isApproveModalOpen && selectedQte && (
        <div className="modal-backdrop" onClick={() => setIsApproveModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="card__title flex items-center gap-2">
                <Landmark size={18} />
                Approve & issue PO
              </h3>
            </div>
            <div className="modal__body space-y-4">
              <p className="text-sm text-muted">
                You are selecting <strong>{selectedQte.vendorName}</strong> as the winner for{' '}
                <strong>{rfq.title}</strong>. This will issue a purchase order worth{' '}
                <strong>{formatCurrency(selectedQte.totalAmount)}</strong>.
              </p>
              <div>
                <label className="input-label">Manager approval remarks (min 10 chars)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide technical evaluation justification..."
                  className="input resize-none"
                />
                <p className="input-help">{remarks.length} / 10 characters minimum</p>
              </div>
            </div>
            <div className="modal__footer">
              <button type="button" onClick={() => setIsApproveModalOpen(false)} className="btn btn--secondary btn--sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWinner}
                disabled={remarks.length < 10 || approveQteMutation.isPending}
                className="btn btn--primary btn--sm"
              >
                Confirm & approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
