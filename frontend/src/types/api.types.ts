import type {
  UserRole,
  VendorStatus,
  RFQStatus,
  QuotationStatus,
  POStatus,
  InvoiceStatus,
} from './enums';

// ─── Base API Types ──────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

/**
 * Wraps an array response from a paginated endpoint.
 * Backend returns `data: { items, total, page, limit }`.
 */
export interface PaginatedData<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  vendorId?: string;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface VendorCategory {
  id: string;
  name: string;
  description?: string;
}

/**
 * Frontend-friendly shape. The API layer maps backend fields:
 *   companyName -> name
 *   gstin       -> gstNumber
 *   pan         -> panNumber
 *   address     -> stringified address (kept as object too)
 */
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  addressObj?: VendorAddress;
  gstNumber?: string;
  panNumber?: string;
  contactPerson?: string;
  categoryId?: string;
  category?: string;
  status: VendorStatus;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── RFQ ─────────────────────────────────────────────────────────────────────

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description?: string;
  status: RFQStatus;
  deadline?: string;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quotation ───────────────────────────────────────────────────────────────

export interface Quotation {
  id: string;
  quotationNumber: string;
  rfqId?: string;
  rfqTitle?: string;
  vendorId: string;
  vendorName?: string;
  status: QuotationStatus;
  totalAmount: number;
  validUntil?: string;
  terms?: string;
  notes?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Purchase Order ──────────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName?: string;
  quotationId?: string;
  status: POStatus;
  totalAmount: number;
  shippingAddress?: VendorAddress;
  terms?: string;
  expectedDelivery?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  purchaseOrderId?: string;
  poNumber?: string;
  status: InvoiceStatus;
  subtotal?: number;
  totalCgst?: number;
  totalSgst?: number;
  totalAmount: number;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
