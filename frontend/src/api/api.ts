import apiClient from './client';
import type {
  User,
  Vendor,
  VendorAddress,
  VendorCategory,
  LoginRequest,
  AuthResponse,
  ApiResponse,
  PaginatedData,
} from '@/types/api.types';
import type { POStatus, InvoiceStatus } from '@/types/enums';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Unwraps backend list endpoints which use `{ items, total, page, limit }`
 * shape. Returns the raw array.
 */
const unwrapList = <T>(payload: PaginatedData<T> | T[] | null | undefined): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items ?? [];
};

// ─── Field mappers ───────────────────────────────────────────────────────────

const formatAddress = (addr?: VendorAddress | null): string | undefined => {
  if (!addr) return undefined;
  const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

const mapVendor = (raw: any): Vendor => {
  if (!raw) return raw;
  return {
    id: raw.id,
    name: raw.companyName ?? raw.name ?? '',
    email: raw.email,
    phone: raw.phone ?? undefined,
    address: typeof raw.address === 'string' ? raw.address : formatAddress(raw.address),
    addressObj: typeof raw.address === 'object' && raw.address !== null ? raw.address : undefined,
    gstNumber: raw.gstin ?? raw.gstNumber ?? undefined,
    panNumber: raw.pan ?? raw.panNumber ?? undefined,
    contactPerson: raw.contactPerson ?? undefined,
    categoryId: raw.categoryId ?? raw.category?.id ?? undefined,
    category: typeof raw.category === 'string' ? raw.category : raw.category?.name ?? undefined,
    status: raw.status,
    rating: raw.rating !== undefined && raw.rating !== null ? Number(raw.rating) : undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

const reverseVendorPayload = (data: Partial<Vendor>): Record<string, any> => {
  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.companyName = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.gstNumber !== undefined) payload.gstin = data.gstNumber;
  if (data.panNumber !== undefined) payload.pan = data.panNumber;
  if (data.contactPerson !== undefined) payload.contactPerson = data.contactPerson;
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.status !== undefined) payload.status = data.status;
  if (data.addressObj !== undefined) payload.address = data.addressObj;
  return payload;
};

const mapRFQ = (raw: any) => {
  if (!raw) return raw;
  return {
    id: raw.id,
    rfqNumber: raw.rfqNumber,
    title: raw.title,
    description: raw.description,
    status: raw.status,
    deadline: raw.deadline,
    createdBy: raw.createdBy,
    creatorName: raw.creator
      ? `${raw.creator.firstName ?? ''} ${raw.creator.lastName ?? ''}`.trim()
      : raw.creatorName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: raw.items,
    rfqVendors: raw.rfqVendors,
  };
};

const mapQuotation = (raw: any) => {
  if (!raw) return raw;
  return {
    id: raw.id,
    quotationNumber: raw.quotationNumber,
    rfqId: raw.rfqId,
    rfqTitle: raw.rfq?.title ?? raw.rfqTitle,
    vendorId: raw.vendorId,
    vendorName: raw.vendor?.companyName ?? raw.vendorName,
    status: raw.status,
    totalAmount: Number(raw.totalAmount ?? 0),
    validUntil: raw.validUntil,
    terms: raw.terms,
    notes: raw.notes,
    submittedAt: raw.submittedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: raw.items,
  };
};

const mapPO = (raw: any) => {
  if (!raw) return raw;
  return {
    id: raw.id,
    poNumber: raw.poNumber,
    vendorId: raw.vendorId,
    vendorName: raw.vendor?.companyName ?? raw.vendorName,
    quotationId: raw.quotationId,
    status: raw.status,
    totalAmount: Number(raw.totalAmount ?? 0),
    shippingAddress: raw.shippingAddress,
    terms: raw.terms,
    expectedDelivery: raw.expectedDelivery,
    issuedAt: raw.issuedAt ?? raw.acknowledgedAt ?? null,
    acknowledgedAt: raw.acknowledgedAt,
    fulfilledAt: raw.fulfilledAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: raw.items,
  };
};

const mapInvoice = (raw: any) => {
  if (!raw) return raw;
  return {
    id: raw.id,
    invoiceNumber: raw.invoiceNumber,
    vendorId: raw.vendorId,
    vendorName: raw.vendor?.companyName ?? raw.vendorName,
    purchaseOrderId: raw.purchaseOrderId ?? raw.poId,
    poNumber: raw.purchaseOrder?.poNumber ?? raw.poNumber,
    status: raw.status,
    subtotal: raw.subtotal !== undefined ? Number(raw.subtotal) : undefined,
    totalCgst: raw.totalCgst !== undefined ? Number(raw.totalCgst) : undefined,
    totalSgst: raw.totalSgst !== undefined ? Number(raw.totalSgst) : undefined,
    totalAmount: Number(raw.totalAmount ?? 0),
    dueDate: raw.dueDate,
    paidAt: raw.paidAt,
    notes: raw.notes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: raw.items,
  };
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const refreshAccessToken = async (): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
  return response.data.data!;
};

// ─── Users (Admin User Management) ───────────────────────────────────────────

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedData<User> | User[]>>('/admin/users');
  return unwrapList(response.data.data);
};

export const createUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
  return response.data.data!;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  return response.data.data!;
};

// ─── Vendors ─────────────────────────────────────────────────────────────────

export interface VendorParams {
  search?: string;
  status?: string;
  categoryId?: string;
  /** Legacy: kept for forwards-compat with old callers passing category name */
  category?: string;
}

export const getVendors = async (params?: VendorParams): Promise<Vendor[]> => {
  const cleaned: Record<string, string> = {};
  if (params?.search) cleaned.search = params.search;
  if (params?.status) cleaned.status = params.status;
  if (params?.categoryId) cleaned.categoryId = params.categoryId;

  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>('/vendors', {
    params: cleaned,
  });
  return unwrapList(response.data.data).map(mapVendor);
};

export const getVendorById = async (id: string): Promise<Vendor> => {
  const response = await apiClient.get<ApiResponse<any>>(`/vendors/${id}`);
  return mapVendor(response.data.data);
};

export const createVendor = async (data: Partial<Vendor>): Promise<Vendor> => {
  const response = await apiClient.post<ApiResponse<any>>('/vendors', reverseVendorPayload(data));
  return mapVendor(response.data.data);
};

export const updateVendor = async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
  // status updates are PATCH /:id/status, all other updates are PUT /:id
  const { status, ...rest } = data;
  if (status && Object.keys(rest).length === 0) {
    const response = await apiClient.patch<ApiResponse<any>>(`/vendors/${id}/status`, { status });
    return mapVendor(response.data.data);
  }
  const response = await apiClient.put<ApiResponse<any>>(
    `/vendors/${id}`,
    reverseVendorPayload(rest)
  );
  return mapVendor(response.data.data);
};

export const getVendorCategories = async (): Promise<VendorCategory[]> => {
  const response = await apiClient.get<ApiResponse<VendorCategory[]>>('/vendors/categories');
  return response.data.data ?? [];
};

// ─── RFQs ────────────────────────────────────────────────────────────────────

export interface RFQParams {
  search?: string;
  status?: string;
}

export const getRFQs = async (params?: RFQParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>('/rfqs', { params });
  return unwrapList(response.data.data).map(mapRFQ);
};

export const getRFQById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/rfqs/${id}`);
  return mapRFQ(response.data.data);
};

export const createRFQ = async (data: any): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/rfqs', data);
  return mapRFQ(response.data.data);
};

export const updateRFQ = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.put<ApiResponse<any>>(`/rfqs/${id}`, data);
  return mapRFQ(response.data.data);
};

// ─── Quotations ──────────────────────────────────────────────────────────────

export interface QuotationParams {
  rfqId?: string;
  vendorId?: string;
}

export const getQuotations = async (params?: QuotationParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>('/quotations', { params });
  return unwrapList(response.data.data).map(mapQuotation);
};

export const getQuotationById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/quotations/${id}`);
  return mapQuotation(response.data.data);
};

export const submitQuotation = async (data: any): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/quotations', data);
  return mapQuotation(response.data.data);
};

export const approveQuotation = async (id: string, comments: string): Promise<any> => {
  // Approvals are routed under /api/approvals/quotations/:id with action APPROVE
  const response = await apiClient.post<ApiResponse<any>>(
    `/approvals/quotations/${id}`,
    { action: 'APPROVE', comments }
  );
  return response.data.data;
};

export const rejectQuotation = async (id: string, comments: string): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>(
    `/approvals/quotations/${id}`,
    { action: 'REJECT', comments }
  );
  return response.data.data;
};

// ─── Approvals ───────────────────────────────────────────────────────────────

export const getApprovals = async (): Promise<any[]> => {
  // No catch-all backend endpoint — surface recent quotation approvals derived from
  // the pending-quotations list. Best-effort.
  return [];
};

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export interface POParams {
  status?: POStatus;
}

export const getPurchaseOrders = async (params?: POParams): Promise<any[]> => {
  const cleaned: Record<string, string> = {};
  if (params?.status) cleaned.status = params.status;
  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>(
    '/purchase-orders',
    { params: cleaned }
  );
  return unwrapList(response.data.data).map(mapPO);
};

export const getPOById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/purchase-orders/${id}`);
  return mapPO(response.data.data);
};

export const updatePOStatus = async (id: string, status: POStatus): Promise<any> => {
  const response = await apiClient.patch<ApiResponse<any>>(
    `/purchase-orders/${id}/status`,
    { status }
  );
  return mapPO(response.data.data);
};

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoiceParams {
  status?: InvoiceStatus;
}

export const getInvoices = async (params?: InvoiceParams): Promise<any[]> => {
  const cleaned: Record<string, string> = {};
  if (params?.status) cleaned.status = params.status;
  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>(
    '/invoices',
    { params: cleaned }
  );
  return unwrapList(response.data.data).map(mapInvoice);
};

export const getInvoiceById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/invoices/${id}`);
  return mapInvoice(response.data.data);
};

export const createInvoiceFromPO = async (poId: string, notes: string): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/invoices', { poId, notes });
  return mapInvoice(response.data.data);
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<any> => {
  const response = await apiClient.patch<ApiResponse<any>>(`/invoices/${id}/status`, { status });
  return mapInvoice(response.data.data);
};

// ─── Activity Logs ───────────────────────────────────────────────────────────

export interface LogParams {
  entity?: string;
  userName?: string;
}

export const getActivityLogs = async (params?: LogParams): Promise<any[]> => {
  const cleaned: Record<string, string> = {};
  if (params?.entity) cleaned.entityType = params.entity.toLowerCase();
  if (params?.userName) cleaned.search = params.userName;
  const response = await apiClient.get<ApiResponse<PaginatedData<any> | any[]>>(
    '/activity-logs',
    { params: cleaned }
  );
  return unwrapList(response.data.data).map((log: any) => ({
    id: log.id,
    action: log.action,
    entity: log.entityType,
    entityId: log.entityId,
    userId: log.userId,
    userName: log.user
      ? `${log.user.firstName ?? ''} ${log.user.lastName ?? ''}`.trim() || log.user.email
      : 'System',
    details: typeof log.metadata === 'object' && log.metadata !== null
      ? JSON.stringify(log.metadata)
      : String(log.metadata ?? ''),
    createdAt: log.createdAt,
  }));
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/dashboard/stats');
  return response.data.data;
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReportsAnalytics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/reports/spend-by-category');
  const data = response.data.data ?? [];
  // Best-effort shape compatible with the ReportsPage UI
  return {
    monthlySpending: [],
    rfqStatusBreakdown: [],
    topVendors: [],
    vendorPerformance: [],
    categorySpend: data,
  };
};
