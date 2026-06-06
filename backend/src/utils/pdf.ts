import puppeteer from 'puppeteer';
import { numberToWords } from './index';
import { logger } from './logger';
import { Prisma } from '@prisma/client';
type Decimal = Prisma.Decimal;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvoiceItemData {
  description: string;
  quantity: Decimal;
  unit: string;
  unitPrice: Decimal;
  hsnCode: string | null;
  gstRate: Decimal;
  cgstAmount: Decimal;
  sgstAmount: Decimal;
  lineTotal: Decimal;
}

export interface InvoiceData {
  invoiceNumber: string;
  createdAt: Date;
  dueDate: Date | null;
  notes: string | null;
  // Seller (vendor)
  vendorName: string;
  vendorGstin: string | null;
  vendorAddress: Record<string, string> | null;
  // Buyer (company)
  buyerName: string;
  buyerGstin?: string;
  buyerAddress?: Record<string, string>;
  // PO reference
  poNumber: string;
  // Financials
  subtotal: Decimal;
  totalCgst: Decimal;
  totalSgst: Decimal;
  totalAmount: Decimal;
  // Line items
  items: InvoiceItemData[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (d: Decimal | number): string =>
  Number(d).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const addressLines = (addr: Record<string, string> | null | undefined): string => {
  if (!addr) return '—';
  return [addr.street, addr.city, addr.state, addr.pincode, addr.country]
    .filter(Boolean)
    .join(', ');
};

// ── HTML Template ─────────────────────────────────────────────────────────────

const buildInvoiceHtml = (inv: InvoiceData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 32px; }
    h1 { font-size: 24px; color: #6366f1; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .party { width: 48%; }
    .party h3 { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 6px; }
    .party p { line-height: 1.6; }
    .meta { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; display: flex; gap: 32px; }
    .meta-item { display: flex; flex-direction: column; }
    .meta-item span:first-child { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-item span:last-child { font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.04em; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .summary { margin-left: auto; width: 320px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 16px; border-bottom: 1px solid #f1f5f9; }
    .summary-row:last-child { border-bottom: none; background: #6366f1; color: #fff; font-weight: 700; font-size: 14px; }
    .words-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
    .words-box span { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; color: #64748b; font-size: 11px; }
  </style>
</head>
<body>
  <h1>TAX INVOICE</h1>
  <p class="subtitle">VendorBridge Procurement Platform</p>

  <div class="header">
    <div class="party">
      <h3>Seller (Vendor)</h3>
      <p><strong>${inv.vendorName}</strong></p>
      <p>${addressLines(inv.vendorAddress)}</p>
      ${inv.vendorGstin ? `<p>GSTIN: <strong>${inv.vendorGstin}</strong></p>` : ''}
    </div>
    <div class="party">
      <h3>Buyer</h3>
      <p><strong>${inv.buyerName}</strong></p>
      <p>${addressLines(inv.buyerAddress)}</p>
      ${inv.buyerGstin ? `<p>GSTIN: <strong>${inv.buyerGstin}</strong></p>` : ''}
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><span>Invoice No.</span><span>${inv.invoiceNumber}</span></div>
    <div class="meta-item"><span>Invoice Date</span><span>${inv.createdAt.toLocaleDateString('en-IN')}</span></div>
    ${inv.dueDate ? `<div class="meta-item"><span>Due Date</span><span>${inv.dueDate.toLocaleDateString('en-IN')}</span></div>` : ''}
    <div class="meta-item"><span>PO Reference</span><span>${inv.poNumber}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>HSN</th>
        <th class="text-right">Qty</th>
        <th>Unit</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">GST%</th>
        <th class="text-right">CGST</th>
        <th class="text-right">SGST</th>
        <th class="text-right">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${inv.items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.description}</td>
          <td>${item.hsnCode ?? '—'}</td>
          <td class="text-right">${fmt(item.quantity)}</td>
          <td>${item.unit}</td>
          <td class="text-right">₹${fmt(item.unitPrice)}</td>
          <td class="text-right">${fmt(item.gstRate)}%</td>
          <td class="text-right">₹${fmt(item.cgstAmount)}</td>
          <td class="text-right">₹${fmt(item.sgstAmount)}</td>
          <td class="text-right">₹${fmt(item.lineTotal)}</td>
        </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row"><span>Subtotal</span><span>₹${fmt(inv.subtotal)}</span></div>
    <div class="summary-row"><span>Total CGST</span><span>₹${fmt(inv.totalCgst)}</span></div>
    <div class="summary-row"><span>Total SGST</span><span>₹${fmt(inv.totalSgst)}</span></div>
    <div class="summary-row"><span>Grand Total</span><span>₹${fmt(inv.totalAmount)}</span></div>
  </div>

  <div class="words-box">
    <span>Amount in Words</span>
    <strong>${numberToWords(Number(inv.totalAmount))}</strong>
  </div>

  ${inv.notes ? `<p style="margin-bottom:24px;color:#475569"><strong>Notes:</strong> ${inv.notes}</p>` : ''}

  <div class="footer">
    <p>This is a computer-generated invoice. No signature is required.</p>
    <p style="margin-top:6px">Generated by VendorBridge Procurement Platform on ${new Date().toLocaleString('en-IN')}</p>
  </div>
</body>
</html>
`;

// ── PDF Generator ─────────────────────────────────────────────────────────────

/**
 * Generates a GST-compliant invoice PDF using Puppeteer.
 * Returns the PDF as a Buffer (suitable for upload to Cloudinary or direct download).
 *
 * @param invoice - Structured invoice data with all GST fields
 * @returns Buffer containing the PDF
 */
export const generateInvoicePDF = async (invoice: InvoiceData): Promise<Buffer> => {
  logger.debug('Generating invoice PDF', { invoiceNumber: invoice.invoiceNumber });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    const html = buildInvoiceHtml(invoice);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    logger.debug('Invoice PDF generated', {
      invoiceNumber: invoice.invoiceNumber,
      bytes: pdfBuffer.length,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};
