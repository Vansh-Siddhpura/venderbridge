import { InvoiceStatus, UserRole } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import { ERROR_CODES, CLOUDINARY_FOLDERS, ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';
import { generateSequenceNumber, getPaginationParams } from '../../utils';
import { uploadBuffer } from '../../utils/cloudinary';
import { generateInvoicePDF, type InvoiceData } from '../../utils/pdf';
import { sendInvoiceEmail } from '../../utils/email';
import * as repo from './repository';
import type { UpdateInvoiceStatusInput, ListInvoicesQuery } from './schema';
import { findPOById } from '../purchase-orders/repository';
import prisma from '../../config/database';

export const listInvoices = async (query: ListInvoicesQuery, requesterRole: UserRole, requesterVendorId?: string) => {
  const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
  const vendorId = requesterRole === UserRole.VENDOR ? requesterVendorId : query.vendorId;
  const { invoices, total } = await repo.findInvoices({
    skip, take: limit,
    status: query.status as InvoiceStatus | undefined,
    vendorId, poId: query.poId,
    sortBy, sortOrder,
  });
  return { invoices, total, page, limit };
};

export const getInvoice = async (id: string, requesterRole: UserRole, requesterVendorId?: string) => {
  const invoice = await repo.findInvoiceById(id);
  if (!invoice) throw new AppError(ERROR_CODES.NOT_FOUND, 'Invoice not found', 404);
  if (requesterRole === UserRole.VENDOR && invoice.vendorId !== requesterVendorId) {
    throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  }
  return invoice;
};

/**
 * Generates an invoice from a FULFILLED PO.
 * Creates the record, generates PDF, uploads to Cloudinary (optional), and saves URL.
 */
export const generateInvoice = async (poId: string, vendorId: string, userId: string, ip: string) => {
  const po = await findPOById(poId);
  if (!po) throw new AppError(ERROR_CODES.NOT_FOUND, 'PO not found', 404);
  if (po.vendorId !== vendorId) throw new AppError(ERROR_CODES.FORBIDDEN, 'Access denied', 403);
  if (po.status !== 'FULFILLED') {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, 'Invoice can only be generated from a FULFILLED PO', 400);
  }

  const existing = await repo.findInvoiceByPO(poId);
  if (existing) throw new AppError(ERROR_CODES.CONFLICT, 'Invoice already exists for this PO', 409);

  const invoiceNumber = await generateSequenceNumber('invoice');
  const invoice = await repo.createInvoiceFromPO(poId, invoiceNumber, userId, ip);

  // Generate PDF asynchronously but await to return URL
  try {
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      vendorName: (invoice as any).vendor.companyName,
      vendorGstin: (invoice as any).vendor.gstin,
      vendorAddress: ((invoice as any).vendor.address as Record<string, string>) ?? null,
      buyerName: 'VendorBridge Buyer Corp', // Static for now, usually from Tenant config
      poNumber: (invoice as any).po.poNumber,
      subtotal: invoice.subtotal,
      totalCgst: invoice.totalCgst,
      totalSgst: invoice.totalSgst,
      totalAmount: invoice.totalAmount,
      items: (invoice as any).items,
    });

    // Save to Cloudinary (skips if not configured)
    const pdfUrl = await uploadBuffer(pdfBuffer, CLOUDINARY_FOLDERS.INVOICES, invoice.invoiceNumber);

    if (pdfUrl) {
      await repo.updateInvoicePdfUrl(invoice.id, pdfUrl);
      invoice.pdfUrl = pdfUrl;
    }

    // Log PDF generated
    await prisma.activityLog.create({
      data: {
        userId, action: ACTIVITY_ACTIONS.INVOICE_PDF_GENERATED,
        entityType: ENTITY_TYPES.INVOICE, entityId: invoice.id,
        metadata: { pdfUrl }, ipAddress: ip,
      },
    });
  } catch (err) {
    console.error('Failed to generate/upload PDF for invoice', err);
    // Invoice is created, just without PDF URL
  }

  return invoice;
};

export const updateInvoiceStatus = async (
  id: string, input: UpdateInvoiceStatusInput, userId: string, ip: string
) => {
  const invoice = await repo.findInvoiceById(id);
  if (!invoice) throw new AppError(ERROR_CODES.NOT_FOUND, 'Invoice not found', 404);

  const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    DRAFT: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
    SENT: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED, InvoiceStatus.OVERDUE],
    OVERDUE: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
    PAID: [],
    CANCELLED: [],
  };

  if (!validTransitions[invoice.status]?.includes(input.status as InvoiceStatus)) {
    throw new AppError(ERROR_CODES.INVALID_TRANSITION, `Cannot transition invoice from ${invoice.status} to ${input.status}`, 400);
  }

  return repo.updateInvoiceStatus(id, input.status as InvoiceStatus, input.notes, userId, ip);
};

export const downloadInvoicePdf = async (id: string, requesterRole: UserRole, requesterVendorId?: string) => {
  const invoice = await getInvoice(id, requesterRole, requesterVendorId);

  // If there's an uploaded URL, client should just fetch that
  if (invoice.pdfUrl) {
    return { type: 'url', url: invoice.pdfUrl };
  }

  // Otherwise, regenerate dynamically (fallback)
  const pdfBuffer = await generateInvoicePDF({
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    notes: invoice.notes,
    vendorName: (invoice as any).vendor.companyName,
    vendorGstin: (invoice as any).vendor.gstin,
    vendorAddress: ((invoice as any).vendor.address as Record<string, string>) ?? null,
    buyerName: 'VendorBridge Buyer Corp',
    poNumber: (invoice as any).po.poNumber,
    subtotal: invoice.subtotal,
    totalCgst: invoice.totalCgst,
    totalSgst: invoice.totalSgst,
    totalAmount: invoice.totalAmount,
    items: (invoice as any).items,
  });

  return { type: 'buffer', buffer: pdfBuffer, filename: `${invoice.invoiceNumber}.pdf` };
};
