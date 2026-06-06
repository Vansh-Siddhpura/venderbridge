import apiClient from './client';
import type {
  User,
  Vendor,
  LoginRequest,
  AuthResponse,
  ApiResponse,
} from '@/types/api.types';
import type { POStatus, InvoiceStatus } from '@/types/enums';

// ─── Auth API ────────────────────────────────────────────────────────────────
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

// ─── Users API (Admin User Management) ────────────────────────────────────────
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>('/admin/users');
  return response.data.data!;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
  return response.data.data!;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  return response.data.data!;
};

// ─── Vendors API ─────────────────────────────────────────────────────────────
export interface VendorParams {
  search?: string;
  status?: string;
  category?: string;
}

export const getVendors = async (params?: VendorParams): Promise<Vendor[]> => {
  const response = await apiClient.get<ApiResponse<Vendor[]>>('/vendors', { params });
  return response.data.data!;
};

export const getVendorById = async (id: string): Promise<Vendor> => {
  const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);
  return response.data.data!;
};

export const createVendor = async (data: Partial<Vendor>): Promise<Vendor> => {
  const response = await apiClient.post<ApiResponse<Vendor>>('/vendors', data);
  return response.data.data!;
};

export const updateVendor = async (id: string, data: Partial<Vendor>): Promise<Vendor> => {
  const response = await apiClient.put<ApiResponse<Vendor>>(`/vendors/${id}`, data);
  return response.data.data!;
};

// ─── RFQs API ────────────────────────────────────────────────────────────────
export interface RFQParams {
  search?: string;
  status?: string;
}

export const getRFQs = async (params?: RFQParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/rfqs', { params });
  return response.data.data!;
};

export const getRFQById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/rfqs/${id}`);
  return response.data.data!;
};

export const createRFQ = async (data: any): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/rfqs', data);
  return response.data.data!;
};

export const updateRFQ = async (id: string, data: any): Promise<any> => {
  const response = await apiClient.put<ApiResponse<any>>(`/rfqs/${id}`, data);
  return response.data.data!;
};

// ─── Quotations API ──────────────────────────────────────────────────────────
export interface QuotationParams {
  rfqId?: string;
  vendorId?: string;
}

export const getQuotations = async (params?: QuotationParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/quotations', { params });
  return response.data.data!;
};

export const getQuotationById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/quotations/${id}`);
  return response.data.data!;
};

export const submitQuotation = async (data: any): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/quotations', data);
  return response.data.data!;
};

export const approveQuotation = async (id: string, comments: string): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>(`/quotations/${id}/approve`, { comments });
  return response.data.data!;
};

export const rejectQuotation = async (id: string, comments: string): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>(`/quotations/${id}/reject`, { comments });
  return response.data.data!;
};

// ─── Approvals API ───────────────────────────────────────────────────────────
export const getApprovals = async (): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/approvals');
  return response.data.data!;
};

// ─── Purchase Orders API ──────────────────────────────────────────────────────
export interface POParams {
  status?: POStatus;
}

export const getPurchaseOrders = async (params?: POParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/purchase-orders', { params });
  return response.data.data!;
};

export const getPOById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/purchase-orders/${id}`);
  return response.data.data!;
};

export const updatePOStatus = async (id: string, status: POStatus): Promise<any> => {
  const response = await apiClient.put<ApiResponse<any>>(`/purchase-orders/${id}/status`, { status });
  return response.data.data!;
};

// ─── Invoices API ────────────────────────────────────────────────────────────
export interface InvoiceParams {
  status?: InvoiceStatus;
}

export const getInvoices = async (params?: InvoiceParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/invoices', { params });
  return response.data.data!;
};

export const getInvoiceById = async (id: string): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>(`/invoices/${id}`);
  return response.data.data!;
};

export const createInvoiceFromPO = async (poId: string, notes: string): Promise<any> => {
  const response = await apiClient.post<ApiResponse<any>>('/invoices/from-po', { poId, notes });
  return response.data.data!;
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<any> => {
  const response = await apiClient.put<ApiResponse<any>>(`/invoices/${id}/status`, { status });
  return response.data.data!;
};

// ─── Activity Logs API ────────────────────────────────────────────────────────
export interface LogParams {
  entity?: string;
  userName?: string;
}

export const getActivityLogs = async (params?: LogParams): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/activity-logs', { params });
  return response.data.data!;
};

// ─── Dashboard API ───────────────────────────────────────────────────────────
export const getDashboardStats = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/dashboard/stats');
  return response.data.data!;
};

// ─── Reports API ─────────────────────────────────────────────────────────────
export const getReportsAnalytics = async (): Promise<any> => {
  const response = await apiClient.get<ApiResponse<any>>('/reports/analytics');
  return response.data.data!;
};
