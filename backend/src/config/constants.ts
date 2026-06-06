// ─── VendorBridge Constants ───────────────────────────────────────────────────
// Single source of truth for all magic strings and numbers.
// Import from here — never hardcode these values in other files.

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH = {
  BCRYPT_ROUNDS: 12,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  COOKIE_NAME: 'refresh_token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  },
} as const;

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ── Sequence Number Formats ───────────────────────────────────────────────────
export const SEQUENCE = {
  RFQ: 'rfq',
  PO: 'po',
  INVOICE: 'invoice',
} as const;

export type SequenceType = (typeof SEQUENCE)[keyof typeof SEQUENCE];

// ── Activity Log Actions ──────────────────────────────────────────────────────
export const ACTIVITY_ACTIONS = {
  // Auth
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  USER_LOGGED_OUT: 'user.logged_out',
  USER_PASSWORD_RESET: 'user.password_reset',
  // Vendor
  VENDOR_REGISTERED: 'vendor.registered',
  VENDOR_STATUS_UPDATED: 'vendor.status_updated',
  VENDOR_UPDATED: 'vendor.updated',
  // RFQ
  RFQ_CREATED: 'rfq.created',
  RFQ_UPDATED: 'rfq.updated',
  RFQ_PUBLISHED: 'rfq.published',
  RFQ_CLOSED: 'rfq.closed',
  RFQ_CANCELLED: 'rfq.cancelled',
  RFQ_VENDORS_ASSIGNED: 'rfq.vendors_assigned',
  // RFQ Items
  RFQ_ITEM_ADDED: 'rfq_item.added',
  RFQ_ITEM_UPDATED: 'rfq_item.updated',
  RFQ_ITEM_REMOVED: 'rfq_item.removed',
  // Quotation
  QUOTATION_CREATED: 'quotation.created',
  QUOTATION_SUBMITTED: 'quotation.submitted',
  QUOTATION_SHORTLISTED: 'quotation.shortlisted',
  QUOTATION_REJECTED: 'quotation.rejected',
  QUOTATION_SELECTED: 'quotation.selected',
  QUOTATION_UPDATED: 'quotation.updated',
  // Approval
  APPROVAL_CREATED: 'approval.created',
  // Purchase Order
  PO_GENERATED: 'po.generated',
  PO_STATUS_UPDATED: 'po.status_updated',
  // Invoice
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_STATUS_UPDATED: 'invoice.status_updated',
  INVOICE_PDF_GENERATED: 'invoice.pdf_generated',
  INVOICE_EMAILED: 'invoice.emailed',
} as const;

// ── Activity Log Entity Types ─────────────────────────────────────────────────
export const ENTITY_TYPES = {
  USER: 'user',
  VENDOR: 'vendor',
  VENDOR_CATEGORY: 'vendor_category',
  RFQ: 'rfq',
  RFQ_ITEM: 'rfq_item',
  QUOTATION: 'quotation',
  APPROVAL: 'approval',
  PO: 'po',
  INVOICE: 'invoice',
} as const;

// ── Error Codes ───────────────────────────────────────────────────────────────
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  // Auth
  AUTH_MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  AUTH_INSUFFICIENT_ROLE: 'AUTH_INSUFFICIENT_ROLE',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_INACTIVE: 'AUTH_ACCOUNT_INACTIVE',
  AUTH_VENDOR_PENDING: 'AUTH_VENDOR_PENDING',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_TOKEN_REVOKED: 'AUTH_TOKEN_REVOKED',
  // Resource
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FORBIDDEN: 'FORBIDDEN',
  // State Machine
  INVALID_TRANSITION: 'INVALID_TRANSITION',
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  // Sequence
  SEQUENCE_NOT_FOUND: 'SEQUENCE_NOT_FOUND',
} as const;

// ── Cloudinary Folders ────────────────────────────────────────────────────────
export const CLOUDINARY_FOLDERS = {
  INVOICES: 'vendorbridge/invoices',
  DOCUMENTS: 'vendorbridge/documents',
} as const;

// ── Email ─────────────────────────────────────────────────────────────────────
export const EMAIL = {
  FROM_NAME: 'VendorBridge',
  SUBJECTS: {
    RFQ_INVITE: 'You have been invited to submit a quotation',
    INVOICE: 'Invoice from VendorBridge',
    PASSWORD_RESET: 'Reset your VendorBridge password',
    VENDOR_APPROVED: 'Your vendor account has been approved',
  },
} as const;

// ── GST ───────────────────────────────────────────────────────────────────────
export const GST = {
  // CGST and SGST are each half of the total GST rate
  SPLIT_FACTOR: 2,
} as const;
