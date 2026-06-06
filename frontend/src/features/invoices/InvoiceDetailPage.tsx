import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import { useInvoiceDetailQuery, useUpdateInvoiceStatusMutation, useSendEmailMutation } from './hooks/useInvoices';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge, InvoicePrintTemplate } from '@/components/shared';
import { InvoiceStatus } from '@/types/enums';
import { ArrowLeft, Printer, Download, Mail, CheckCircle, CreditCard, X } from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isProcurementOfficer, isAdmin } = useAuth();

  // Queries
  const { data: invoice, isLoading } = useInvoiceDetailQuery(id);
  
  // Mutations
  const updateStatusMutation = useUpdateInvoiceStatusMutation();
  const sendEmailMutation = useSendEmailMutation();

  // Print Ref and hook
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  // Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!invoice) {
    return (
      <div className="text-center p-8 bg-surface border border-default rounded-lg">
        <p className="text-muted">Invoice not found.</p>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm cursor-pointer"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  // PDF Download using html2pdf.js
  const handleDownloadPDF = () => {
    const element = componentRef.current;
    if (!element) return;

    const options = {
      margin: 10,
      filename: `TaxInvoice_${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    html2pdf().from(element).set(options).save();
  };

  const handleOpenEmailModal = () => {
    setEmailSubject(`Tax Invoice ${invoice.invoiceNumber} - VendorBridge ERP`);
    setEmailMessage(
      `Dear Finance Team,\n\nPlease find attached Tax Invoice ${invoice.invoiceNumber} for PO Reference ${invoice.poNumber}.\n\nTotal Amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.totalAmount)}\n\nBest regards,\nProcurement Team`
    );
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = () => {
    sendEmailMutation.mutate(
      {
        email: invoice.vendorEmail,
        subject: emailSubject,
        message: emailMessage,
      },
      {
        onSuccess: () => {
          setIsEmailModalOpen(false);
        },
      }
    );
  };

  const handleUpdateStatus = (status: InvoiceStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const canApprove = (isProcurementOfficer || isAdmin) && invoice.status === InvoiceStatus.SUBMITTED;
  const canPay = (isProcurementOfficer || isAdmin) && invoice.status === InvoiceStatus.APPROVED;

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        breadcrumbs={[
          { label: 'Invoices', href: '/invoices' },
          { label: 'Details' },
        ]}
        action={
          <button
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-default rounded-md text-sm font-semibold text-primary hover:bg-primary-light flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Document Action Control Board */}
        <div className="lg:col-span-1 bg-surface border border-default rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
            Invoice Console
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted">Status:</span>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted">PO Ref:</span>
              <span className="font-semibold text-primary">{invoice.poNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted">Total:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.totalAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-default flex flex-col">
            <button
              onClick={handlePrint}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-default cursor-pointer"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={handleOpenEmailModal}
              className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-default cursor-pointer"
            >
              <Mail size={14} />
              Email Invoice
            </button>
          </div>

          {(canApprove || canPay) && (
            <div className="space-y-2 pt-4 border-t border-default">
              <span className="block text-[10px] font-bold text-muted uppercase mb-2">Finance Actions</span>
              {canApprove && (
                <button
                  onClick={() => handleUpdateStatus(InvoiceStatus.APPROVED)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Approve Invoice
                </button>
              )}
              {canPay && (
                <button
                  onClick={() => handleUpdateStatus(InvoiceStatus.PAID)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard size={14} />
                  Mark as Paid
                </button>
              )}
            </div>
          )}
        </div>

        {/* GST Invoice visual layout view */}
        <div className="lg:col-span-3 bg-slate-100 dark:bg-black/40 p-4 rounded-lg overflow-y-auto max-h-[800px] border border-default">
          <div className="bg-white p-2 shadow rounded">
            <InvoicePrintTemplate ref={componentRef} invoice={invoice} />
          </div>
        </div>
      </div>

      {/* Email Invoice Dispatch Dialog */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-default rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-default bg-elevated flex justify-between items-center">
              <h3 className="text-base font-bold text-primary flex items-center gap-1.5">
                <Mail size={18} className="text-primary" />
                Dispatch Invoice via Email
              </h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-muted hover:text-primary cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Recipient</label>
                <input
                  type="email"
                  value={invoice.vendorEmail}
                  readOnly
                  className="w-full px-3 py-2 text-xs rounded bg-elevated border border-default text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Email Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 text-xs rounded bg-surface border border-default text-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded border border-default text-primary hover:bg-primary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending}
                  className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {sendEmailMutation.isPending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
