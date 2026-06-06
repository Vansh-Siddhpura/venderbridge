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
  const acceptedQte = quotations.find((q) => q.status === QuotationStatus.ACCEPTED);

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
      <div className="text-center p-8 bg-surface border border-default rounded-lg">
        <p className="text-muted">RFQ not found.</p>
        <button onClick={() => navigate('/rfqs')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm">
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
              className="px-4 py-2 border border-default rounded-md text-sm font-semibold text-primary hover:bg-primary-light flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Cancel
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-default rounded-lg p-6 shadow-sm space-y-6">
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
                          className="w-full px-2 py-1.5 text-xs rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-muted uppercase mb-1">GST % *</label>
                        <input
                          type="number"
                          {...register(`items.${idx}.taxRate`, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-xs rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
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
                      className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm cursor-pointer flex items-center gap-2"
                  >
                    <Send size={16} />
                    Submit Quotation
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Running totals panel */}
          <div className="bg-surface border border-default rounded-lg p-6 shadow-sm h-fit space-y-4">
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
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between gap-4 mb-6 dark:bg-blue-950/20 dark:border-blue-900/50">
          <div>
            <h4 className="text-sm font-bold text-primary">
              🎉 Quotation Selected
            </h4>
            <p className="text-xs text-muted mt-0.5">
              Quotation by <strong>{acceptedQte.vendorName}</strong> has been selected and approved. Purchase Order has been generated.
            </p>
          </div>
          <StatusBadge status="SELECTED" />
        </div>
      )}

      {quotations.length === 0 ? (
        <div className="text-center p-8 bg-surface border border-default rounded-lg">
          <p className="text-muted">No bids submitted yet for this RFQ.</p>
        </div>
      ) : (
        <div className="w-full bg-surface border border-default rounded-lg shadow-sm overflow-hidden">
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
                              isLowest ? 'bg-blue-100/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300' : 'text-primary'
                            }`}
                          >
                            <div className="font-semibold">{formatCurrency(qItem.unitPrice)} / unit</div>
                            <div className="text-[10px] text-muted mt-1">
                              Total: {formatCurrency(qItem.unitPrice * item.quantity)} (GST {qItem.taxRate}%)
                            </div>
                            {isLowest && (
                              <span className="inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded bg-blue-600 text-white dark:bg-blue-900 text-[9px] font-bold uppercase tracking-wider">
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
                          <Star size={14} className="fill-current text-blue-500" />
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
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer"
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

      {/* Winner Confirmation Drawer Modal */}
      {isApproveModalOpen && selectedQte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-default bg-elevated flex justify-between items-center">
              <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
                <Landmark size={18} className="text-primary" />
                Approve & Issue PO
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted leading-relaxed">
                You are selecting <strong>{selectedQte.vendorName}</strong> as the winner for{' '}
                <strong>{rfq.title}</strong>. This will issue a purchase order worth{' '}
                <strong>{formatCurrency(selectedQte.totalAmount)}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Manager Approvals Remarks * (Min 10 chars)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Provide technical evaluation justification..."
                  className="w-full px-3 py-2 text-xs rounded bg-surface border border-default text-primary focus:outline-none resize-none"
                />
                <p className="text-[10px] text-muted mt-1">
                  Characters typed: {remarks.length} (Need at least 10)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-default text-primary hover:bg-primary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWinner}
                  disabled={remarks.length < 10 || approveQteMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                >
                  Confirm & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
