import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePODetailQuery, useUpdatePOStatusMutation, useCreateInvoiceFromPOMutation } from './hooks/usePurchaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge } from '@/components/shared';
import { POStatus } from '@/types/enums';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ArrowLeft, CheckCircle, FileText, Truck, Receipt } from 'lucide-react';

export default function PODetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isVendor } = useAuth();

  // Queries
  const { data: po, isLoading } = usePODetailQuery(id);
  
  // Mutations
  const updateStatusMutation = useUpdatePOStatusMutation();
  const generateInvoiceMutation = useCreateInvoiceFromPOMutation();

  // States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState('');

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!po) {
    return (
      <div className="text-center p-8 bg-surface border border-default rounded-lg">
        <p className="text-muted">Purchase Order not found.</p>
        <button
          onClick={() => navigate('/purchase-orders')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm cursor-pointer"
        >
          Back to POs
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (status: POStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleCreateInvoice = () => {
    generateInvoiceMutation.mutate(
      { poId: id, notes: invoiceNotes },
      {
        onSuccess: (data) => {
          setIsInvoiceModalOpen(false);
          navigate(`/invoices/${data.id}`);
        },
      }
    );
  };

  // Status-based permissions
  const canAcknowledge = isVendor && po.status === POStatus.ISSUED;
  const canMarkDelivered = isVendor && po.status === POStatus.ACKNOWLEDGED;
  
  // Invoice can be generated when PO is Acknowledged or Delivered
  const canGenerateInvoice =
    (isVendor || user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') &&
    (po.status === POStatus.ACKNOWLEDGED || po.status === POStatus.DELIVERED);

  // Calculate tax breakdown (assuming a default GST of 18% for mock calculation)
  const gstRate = 18;
  const calculatedTax = po.totalAmount * (gstRate / (100 + gstRate));
  const calculatedSubtotal = po.totalAmount - calculatedTax;

  return (
    <div>
      <PageHeader
        title={po.poNumber}
        breadcrumbs={[
          { label: 'Purchase Orders', href: '/purchase-orders' },
          { label: 'Details' },
        ]}
        action={
          <button
            onClick={() => navigate('/purchase-orders')}
            className="px-4 py-2 border border-default rounded-md text-sm font-semibold text-primary hover:bg-primary-light flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details */}
        <div className="lg:col-span-2 bg-surface border border-default rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-default">
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Purchase Order Details
              </span>
              <h2 className="text-xl font-bold text-primary mt-1">PO for {po.vendorName}</h2>
            </div>
            <StatusBadge status={po.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Expected Delivery</span>
                <span className="text-xs font-semibold text-primary block mt-0.5">
                  {formatDate(po.expectedDelivery)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Shipping Address</span>
                <span className="text-xs font-semibold text-primary block mt-0.5">
                  {po.shippingAddress}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Contract Terms</span>
                <span className="text-xs font-semibold text-primary block mt-0.5">{po.terms}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Issued Date</span>
                <span className="text-xs font-semibold text-primary block mt-0.5">
                  {po.issuedAt ? formatDate(po.issuedAt) : 'Not issued'}
                </span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-4 pt-4 border-t border-default">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={16} className="text-primary" />
              PO Line Items ({po.items?.length || 0})
            </h4>
            <div className="border border-default rounded-lg overflow-hidden bg-surface">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-elevated border-b border-default text-muted font-bold">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-right">Quantity</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {po.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="text-primary hover:bg-primary-light/10 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 font-medium">{item.unit}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & GST breakdown */}
            <div className="flex justify-end pt-4">
              <div className="w-full max-w-xs space-y-2 text-xs text-muted border-t border-default pt-4">
                <div className="flex justify-between">
                  <span>Subtotal (Excl. Tax)</span>
                  <span className="font-semibold text-primary">{formatCurrency(calculatedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax amount (18% flat estimate)</span>
                  <span className="font-semibold text-primary">{formatCurrency(calculatedTax)}</span>
                </div>
                <div className="flex justify-between border-t border-default pt-2 text-sm font-bold text-primary">
                  <span>Grand Total</span>
                  <span>{formatCurrency(po.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-surface border border-default rounded-lg p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
            Vendor Actions
          </h3>

          <div className="text-xs text-muted leading-relaxed space-y-3">
            <p><strong>Vendor Name:</strong> {po.vendorName}</p>
            <p><strong>GSTIN:</strong> {po.vendorGst || 'N/A'}</p>
            <p><strong>Contact:</strong> {po.vendorPhone || 'N/A'}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-default">
            {canAcknowledge && (
              <button
                onClick={() => handleUpdateStatus(POStatus.ACKNOWLEDGED)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle size={14} />
                Acknowledge PO
              </button>
            )}

            {canMarkDelivered && (
              <button
                onClick={() => handleUpdateStatus(POStatus.DELIVERED)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Truck size={14} />
                Mark as Delivered
              </button>
            )}

            {canGenerateInvoice && (
              <button
                onClick={() => setIsInvoiceModalOpen(true)}
                className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Receipt size={14} />
                Generate Tax Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generate Invoice Modal Dialog */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-default bg-elevated">
              <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
                <Receipt size={18} className="text-primary" />
                Generate Invoice
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-muted leading-relaxed">
                Generate a tax invoice for PO <strong>{po.poNumber}</strong> with a total amount of{' '}
                <strong>{formatCurrency(po.totalAmount)}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Billing Terms / Notes for Buyer
                </label>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide payment details or bank information..."
                  className="w-full px-3 py-2 text-xs rounded bg-surface border border-default text-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-default text-primary hover:bg-primary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={generateInvoiceMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
