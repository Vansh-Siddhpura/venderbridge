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
      <div className="empty">
        <p className="empty__title">Invoice not found</p>
        <button onClick={() => navigate('/invoices')} className="btn btn--primary mt-4">
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

  const canApprove = (isProcurementOfficer || isAdmin) && invoice.status === InvoiceStatus.DRAFT;
  const canPay = (isProcurementOfficer || isAdmin) && invoice.status === InvoiceStatus.SENT;

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
            className="btn btn--secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Document Action Control Board */}
        <div className="card lg:col-span-1">
          <div className="card__body space-y-4">
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
              className="btn btn--primary btn--block btn--sm uppercase tracking-wider"
            >
              <Printer size={14} />
              Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn--secondary btn--block btn--sm uppercase tracking-wider"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={handleOpenEmailModal}
              className="btn btn--secondary btn--block btn--sm uppercase tracking-wider"
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
                  onClick={() => handleUpdateStatus(InvoiceStatus.SENT)}
                  className="btn btn--primary btn--block btn--sm uppercase tracking-wider"
                >
                  <CheckCircle size={14} />
                  Send Invoice
                </button>
              )}
              {canPay && (
                <button
                  onClick={() => handleUpdateStatus(InvoiceStatus.PAID)}
                  className="btn btn--primary btn--block btn--sm uppercase tracking-wider"
                >
                  <CreditCard size={14} />
                  Mark as Paid
                </button>
              )}
            </div>
          )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-muted p-4 rounded-lg overflow-y-auto max-h-[800px] border border-default">
          <div className="bg-white p-2 shadow rounded">
            <InvoicePrintTemplate ref={componentRef} invoice={invoice} />
          </div>
        </div>
      </div>

      {isEmailModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEmailModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3 className="card__title flex items-center gap-2">
                <Mail size={18} />
                Dispatch invoice via email
              </h3>
              <button type="button" onClick={() => setIsEmailModalOpen(false)} className="btn btn--ghost btn--sm">
                <X size={18} />
              </button>
            </div>
            <div className="modal__body space-y-4">
              <div>
                <label className="input-label">Recipient</label>
                <input type="email" value={invoice.vendorEmail} readOnly className="input bg-muted" />
              </div>
              <div>
                <label className="input-label">Subject</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="input" />
              </div>
              <div>
                <label className="input-label">Email message</label>
                <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} rows={6} className="input resize-none" />
              </div>
            </div>
            <div className="modal__footer">
              <button type="button" onClick={() => setIsEmailModalOpen(false)} className="btn btn--secondary btn--sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending}
                className="btn btn--primary btn--sm"
              >
                {sendEmailMutation.isPending ? 'Sending…' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
