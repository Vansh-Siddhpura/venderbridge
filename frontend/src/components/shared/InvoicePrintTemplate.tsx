import { forwardRef } from 'react';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface InvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  createdAt: string;
  dueDate: string;
  poNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGst: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoicePrintTemplateProps {
  invoice: InvoiceData;
}

function numberToWords(amount: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += words[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += words[n] + ' ';
    }
    return str.trim();
  };

  if (amount === 0) return 'Zero Rupees Only';

  let remaining = Math.floor(amount);
  let wordsStr = '';

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crore > 0) {
    wordsStr += convertLessThanOneThousand(crore) + ' Crore ';
  }

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakh > 0) {
    wordsStr += convertLessThanOneThousand(lakh) + ' Lakh ';
  }

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousand > 0) {
    wordsStr += convertLessThanOneThousand(thousand) + ' Thousand ';
  }

  if (remaining > 0) {
    wordsStr += convertLessThanOneThousand(remaining) + ' ';
  }

  wordsStr = wordsStr.trim() + ' Rupees';

  const paisa = Math.round((amount - Math.floor(amount)) * 100);
  if (paisa > 0) {
    wordsStr += ' and ' + convertLessThanOneThousand(paisa) + ' Paisa';
  }

  return wordsStr + ' Only';
}

export const InvoicePrintTemplate = forwardRef<HTMLDivElement, InvoicePrintTemplateProps>(
  ({ invoice }, ref) => {
    if (!invoice) return null;

    // CGST and SGST are 50% of total GST taxAmount each
    const cgstAmount = invoice.taxAmount / 2;
    const sgstAmount = invoice.taxAmount / 2;

    return (
      <div
        ref={ref}
        className="p-8 bg-white text-slate-900 border border-slate-200 rounded-lg max-w-[850px] mx-auto print:p-0 print:border-none print:shadow-none"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* TAX INVOICE HEADER */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">
                VB
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                VendorBridge Private Limited
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              4th Floor, Tech Park, Outer Ring Road, Mahadevapura, Bengaluru, Karnataka - 560048
              <br />
              GSTIN: 29VBRIDGE0000A1Z0 | Contact: billing@vendorbridge.com
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 tracking-wide">
              TAX INVOICE
            </h1>
            <p className="text-xs text-slate-500 mt-1">Original for Recipient</p>
          </div>
        </div>

        {/* TWO COLUMN INVOICE METADATA */}
        <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Invoice Details
            </h3>
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Invoice No:</td>
                  <td className="py-1 font-bold text-slate-800">{invoice.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Invoice Date:</td>
                  <td className="py-1 text-slate-800">{formatDate(invoice.createdAt)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Due Date:</td>
                  <td className="py-1 text-slate-800">{formatDate(invoice.dueDate)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">PO Number:</td>
                  <td className="py-1 font-bold text-slate-800">{invoice.poNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Seller Details (Vendor)
            </h3>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-slate-800">{invoice.vendorName}</p>
              <p className="text-slate-600">{invoice.vendorAddress}</p>
              <p className="text-slate-600">Email: {invoice.vendorEmail}</p>
              <p className="text-slate-600">Phone: {invoice.vendorPhone}</p>
              <p className="font-bold text-slate-700 mt-1">GSTIN: {invoice.vendorGst}</p>
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-bold">
                <th className="px-3 py-2 w-[40px]">#</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">HSN Code</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit Price</th>
                <th className="px-3 py-2 text-right">GST%</th>
                <th className="px-3 py-2 text-right">CGST</th>
                <th className="px-3 py-2 text-right">SGST</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => {
                const cgst = item.taxAmount / 2;
                const sgst = item.taxAmount / 2;
                return (
                  <tr key={idx} className="text-slate-800">
                    <td className="px-3 py-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-3 font-medium">{item.description}</td>
                    <td className="px-3 py-3 text-slate-500">{item.hsnCode}</td>
                    <td className="px-3 py-3 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-3 py-3 text-right">{item.taxRate}%</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(cgst)}</td>
                    <td className="px-3 py-3 text-right">{formatCurrency(sgst)}</td>
                    <td className="px-3 py-3 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTALS & BREAKDOWN */}
        <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-200">
          <div>
            <div className="mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Amount in Words
              </h4>
              <p className="text-xs font-semibold text-slate-700 italic">
                {numberToWords(invoice.totalAmount)}
              </p>
            </div>
            {invoice.notes && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Vendor Notes
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">{invoice.notes}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal (Excl. Tax)</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Central GST (CGST)</span>
              <span>{formatCurrency(cgstAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>State GST (SGST)</span>
              <span>{formatCurrency(sgstAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold border-t border-slate-100 pt-2">
              <span>Total Tax (GST)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-800 pt-2">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE & TERMS */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 mt-6">
          <div className="text-[10px] text-slate-400 leading-normal">
            <h4 className="font-bold text-slate-500 uppercase mb-1">Terms & Conditions</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Goods once sold will not be taken back.</li>
              <li>Payment terms are strictly subject to purchase order details.</li>
              <li>Interest at 18% per annum will be charged on overdue payments.</li>
              <li>Subject to Bangalore jurisdiction.</li>
            </ol>
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="text-center w-[180px]">
              <div className="h-12 border-b border-dashed border-slate-300" />
              <p className="text-[10px] font-bold text-slate-800 uppercase mt-2">
                Authorized Signatory
              </p>
              <p className="text-[9px] text-slate-400">{invoice.vendorName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrintTemplate.displayName = 'InvoicePrintTemplate';
