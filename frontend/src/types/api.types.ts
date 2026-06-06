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
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson?: string;
  categoryId?: string;
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
  createdAt: string;
  updatedAt: string;
}

// ─── Quotation ───────────────────────────────────────────────────────────────

export interface Quotation {
  id: string;
  quotationNumber: string;
  rfqId?: string;
  vendorId: string;
  status: QuotationStatus;
  totalAmount: number;
  validUntil?: string;
  terms?: string;
  notes?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Purchase Order ──────────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  quotationId?: string;
  status: POStatus;
  totalAmount: number;
  shippingAddress?: string;
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
  purchaseOrderId?: string;
  status: InvoiceStatus;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
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
  refreshToken: string;
}
