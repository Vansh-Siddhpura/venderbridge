import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { MockDatabase } from './mockDb';
import { UserRole, RFQStatus, QuotationStatus, POStatus, InvoiceStatus } from '@/types/enums';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Mock Adapter ────────────────────────────────────────────────────────────
// This replaces the default HTTP adapter so ALL axios methods (.get, .post, .put)
// are intercepted and handled by our mock database layer.

async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  // Strip the baseURL prefix to get the API path
  let url = config.url || '';
  const base = config.baseURL || '';
  if (url.startsWith(base)) {
    url = url.slice(base.length);
  }
  // Also strip leading /api if present (from baseURL join)
  if (url.startsWith('/api')) {
    url = url.slice(4);
  }

  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const params = config.params || {};

  // Get authenticated user
  const { user } = useAuthStore.getState();

  // Simulated latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Response helper
  const successResponse = (responseData: unknown, extra = {}): AxiosResponse => ({
    data: {
      success: true,
      data: responseData,
      ...extra,
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  });

  const errorResponse = (message: string, status = 400): never => {
    const err: any = new Error(message);
    err.response = {
      data: { success: false, message },
      status,
      statusText: 'Error',
      headers: {},
      config,
    };
    throw err;
  };

  // ─── AUTH ROUTING ──────────────────────────────────────────────────────────
  if (url.includes('/auth/login') && method === 'post') {
    const { email, password } = data;
    const users = MockDatabase.getUsers();
    const foundUser = users.find(u => u.email === email && u.passwordHash === password);
    if (!foundUser) {
      return errorResponse('Invalid email or password', 401);
    }
    return successResponse({
      user: {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        isActive: foundUser.isActive,
        vendorId: foundUser.vendorId,
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    });
  }

  if (url.includes('/auth/refresh') && method === 'post') {
    return successResponse({
      accessToken: 'mock-access-token-' + Date.now(),
    });
  }

  if (url.includes('/auth/logout') && method === 'post') {
    return successResponse({ success: true });
  }

  if (url.includes('/auth/signup') && method === 'post') {
    // Mock signup — just return success
    return successResponse({ success: true, message: 'Account created successfully' });
  }

  if (url.includes('/auth/forgot-password') && method === 'post') {
    return successResponse({ success: true, message: 'Password reset link sent' });
  }

  // Ensure authenticated beyond this point
  if (!user) {
    return errorResponse('Unauthorized access', 401);
  }

  // ─── USER MANAGEMENT (ADMIN ONLY) ──────────────────────────────────────────
  if (url === '/admin/users' && method === 'get') {
    const users = MockDatabase.getUsers();
    return successResponse(users);
  }
  if (url === '/admin/users' && method === 'post') {
    const users = MockDatabase.getUsers();
    const newUser = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    MockDatabase.saveUsers(users);
    MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Created User', 'User', newUser.id, `Created user ${newUser.email}`);
    return successResponse(newUser);
  }
  if (url.startsWith('/admin/users/') && method === 'put') {
    const id = url.split('/').pop();
    const users = MockDatabase.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return errorResponse('User not found', 404);
    users[index] = { ...users[index], ...data, updatedAt: new Date().toISOString() };
    MockDatabase.saveUsers(users);
    MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Updated User', 'User', id, `Updated user ${users[index].email}`);
    return successResponse(users[index]);
  }

  // ─── VENDORS ───────────────────────────────────────────────────────────────
  if (url === '/vendors' && method === 'get') {
    let vendors = MockDatabase.getVendors();
    if (params.search) {
      const q = params.search.toLowerCase();
      vendors = vendors.filter(v => v.name.toLowerCase().includes(q) || v.contactPerson.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    }
    if (params.status) {
      vendors = vendors.filter(v => v.status === params.status);
    }
    if (params.category) {
      vendors = vendors.filter(v => v.category === params.category);
    }
    return successResponse(vendors);
  }

  if (url === '/vendors' && method === 'post') {
    const vendors = MockDatabase.getVendors();
    const newVendor = {
      id: `ven-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vendors.unshift(newVendor);
    MockDatabase.saveVendors(vendors);
    MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Created Vendor', 'Vendor', newVendor.id, `Added vendor ${newVendor.name}`);
    return successResponse(newVendor);
  }

  if (url.startsWith('/vendors/') && method === 'get') {
    const id = url.split('/').pop();
    const vendor = MockDatabase.getVendors().find(v => v.id === id);
    if (!vendor) return errorResponse('Vendor not found', 404);
    return successResponse(vendor);
  }

  if (url.startsWith('/vendors/') && method === 'put') {
    const id = url.split('/').pop();
    const vendors = MockDatabase.getVendors();
    const index = vendors.findIndex(v => v.id === id);
    if (index === -1) return errorResponse('Vendor not found', 404);
    vendors[index] = { ...vendors[index], ...data, updatedAt: new Date().toISOString() };
    MockDatabase.saveVendors(vendors);
    MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Updated Vendor', 'Vendor', id, `Updated details for ${vendors[index].name}`);
    return successResponse(vendors[index]);
  }

  // ─── RFQS ──────────────────────────────────────────────────────────────────
  if (url === '/rfqs' && method === 'get') {
    let rfqs = MockDatabase.getRFQs();
    if (user.role === UserRole.VENDOR) {
      rfqs = rfqs.filter(r => 
        r.status !== RFQStatus.DRAFT && 
        r.assignedVendors.some((v: any) => v.vendorId === user.vendorId)
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      rfqs = rfqs.filter(r => r.title.toLowerCase().includes(q) || r.rfqNumber.toLowerCase().includes(q));
    }
    if (params.status) {
      rfqs = rfqs.filter(r => r.status === params.status);
    }
    return successResponse(rfqs);
  }

  if (url === '/rfqs' && method === 'post') {
    const newRfq = MockDatabase.createRFQ(data, user as any);
    return successResponse(newRfq);
  }

  if (url.startsWith('/rfqs/') && method === 'get') {
    const id = url.split('/').pop();
    const rfq = MockDatabase.getRFQs().find(r => r.id === id);
    if (!rfq) return errorResponse('RFQ not found', 404);
    return successResponse(rfq);
  }

  if (url.startsWith('/rfqs/') && method === 'put') {
    const id = url.split('/').pop();
    const rfqs = MockDatabase.getRFQs();
    const index = rfqs.findIndex(r => r.id === id);
    if (index === -1) return errorResponse('RFQ not found', 404);
    const oldStatus = rfqs[index].status;
    rfqs[index] = { ...rfqs[index], ...data, updatedAt: new Date().toISOString() };
    MockDatabase.saveRFQs(rfqs);

    if (oldStatus !== rfqs[index].status) {
      MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Updated RFQ Status', 'RFQ', id, `Changed ${rfqs[index].rfqNumber} status from ${oldStatus} to ${rfqs[index].status}`);
    } else {
      MockDatabase.addLog(user.firstName + ' ' + user.lastName, 'Updated RFQ', 'RFQ', id, `Updated details of ${rfqs[index].rfqNumber}`);
    }
    return successResponse(rfqs[index]);
  }

  // ─── QUOTATIONS ────────────────────────────────────────────────────────────
  if (url === '/quotations' && method === 'get') {
    let qtes = MockDatabase.getQuotations();
    if (params.rfqId) {
      qtes = qtes.filter(q => q.rfqId === params.rfqId);
    }
    if (params.vendorId) {
      qtes = qtes.filter(q => q.vendorId === params.vendorId);
    }
    if (user.role === UserRole.VENDOR) {
      qtes = qtes.filter(q => q.vendorId === user.vendorId);
    }
    return successResponse(qtes);
  }

  if (url === '/quotations' && method === 'post') {
    const newQte = MockDatabase.submitQuotation(data, user as any);
    return successResponse(newQte);
  }

  if (url.match(/\/quotations\/[^/]+\/approve$/) && method === 'post') {
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    const qte = MockDatabase.approveQuotation(id, data.comments, user as any);
    return successResponse(qte);
  }

  if (url.match(/\/quotations\/[^/]+\/reject$/) && method === 'post') {
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    const qte = MockDatabase.rejectQuotation(id, data.comments, user as any);
    return successResponse(qte);
  }

  if (url.startsWith('/quotations/') && method === 'get') {
    const id = url.split('/').pop();
    const qte = MockDatabase.getQuotations().find(q => q.id === id);
    if (!qte) return errorResponse('Quotation not found', 404);
    return successResponse(qte);
  }

  // ─── APPROVALS ─────────────────────────────────────────────────────────────
  if (url === '/approvals' && method === 'get') {
    const approvals = MockDatabase.getApprovals();
    return successResponse(approvals);
  }

  // ─── PURCHASE ORDERS ───────────────────────────────────────────────────────
  if (url === '/purchase-orders' && method === 'get') {
    let pos = MockDatabase.getPurchaseOrders();
    if (user.role === UserRole.VENDOR) {
      pos = pos.filter(p => p.vendorId === user.vendorId);
    }
    if (params.status) {
      pos = pos.filter(p => p.status === params.status);
    }
    return successResponse(pos);
  }

  if (url.match(/\/purchase-orders\/[^/]+\/status$/) && method === 'put') {
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    const updated = MockDatabase.updatePOStatus(id, data.status, user as any);
    return successResponse(updated);
  }

  if (url.startsWith('/purchase-orders/') && method === 'get') {
    const id = url.split('/').pop();
    const po = MockDatabase.getPurchaseOrders().find(p => p.id === id);
    if (!po) return errorResponse('Purchase Order not found', 404);
    return successResponse(po);
  }

  // ─── INVOICES ──────────────────────────────────────────────────────────────
  if (url === '/invoices' && method === 'get') {
    let invoices = MockDatabase.getInvoices();
    if (user.role === UserRole.VENDOR) {
      invoices = invoices.filter(i => i.vendorId === user.vendorId);
    }
    if (params.status) {
      invoices = invoices.filter(i => i.status === params.status);
    }
    return successResponse(invoices);
  }

  if (url === '/invoices/from-po' && method === 'post') {
    const invoice = MockDatabase.createInvoiceFromPO(data.poId, data.notes, user as any);
    return successResponse(invoice);
  }

  if (url.match(/\/invoices\/[^/]+\/status$/) && method === 'put') {
    const parts = url.split('/');
    const id = parts[parts.length - 2];
    const updated = MockDatabase.updateInvoiceStatus(id, data.status, user as any);
    return successResponse(updated);
  }

  if (url.startsWith('/invoices/') && method === 'get') {
    const id = url.split('/').pop();
    const invoice = MockDatabase.getInvoices().find(i => i.id === id);
    if (!invoice) return errorResponse('Invoice not found', 404);
    return successResponse(invoice);
  }

  // ─── ACTIVITY LOGS ─────────────────────────────────────────────────────────
  if (url === '/activity-logs' && method === 'get') {
    let logs = MockDatabase.getLogs();
    if (params.entity) {
      logs = logs.filter(l => l.entity === params.entity);
    }
    if (params.userName) {
      logs = logs.filter(l => l.userName.toLowerCase().includes(params.userName.toLowerCase()));
    }
    return successResponse(logs);
  }

  // ─── DASHBOARD STATS ───────────────────────────────────────────────────────
  if (url === '/dashboard/stats' && method === 'get') {
    const rfqs = MockDatabase.getRFQs();
    const quotations = MockDatabase.getQuotations();
    const pos = MockDatabase.getPurchaseOrders();
    const invoices = MockDatabase.getInvoices();

    let pendingApprovals = 0;
    let activeRFQs = 0;
    let posThisMonth = 0;
    let invoicesOutstanding = 0;

    if (user.role === UserRole.VENDOR) {
      const vId = user.vendorId;
      pendingApprovals = quotations.filter(q => q.vendorId === vId && q.status === QuotationStatus.SUBMITTED).length;
      activeRFQs = rfqs.filter(r => r.status === RFQStatus.PUBLISHED && r.assignedVendors.some((av: any) => av.vendorId === vId)).length;
      posThisMonth = pos.filter(p => p.vendorId === vId && p.status === POStatus.ISSUED).length;
      invoicesOutstanding = invoices.filter(i => i.vendorId === vId && i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED).reduce((sum, i) => sum + i.totalAmount, 0);
    } else {
      pendingApprovals = quotations.filter(q => q.status === QuotationStatus.SUBMITTED).length;
      activeRFQs = rfqs.filter(r => r.status === RFQStatus.PUBLISHED).length;
      posThisMonth = pos.filter(p => p.status !== POStatus.CANCELLED).length;
      invoicesOutstanding = invoices.filter(i => i.status === InvoiceStatus.SUBMITTED || i.status === InvoiceStatus.APPROVED).reduce((sum, i) => sum + i.totalAmount, 0);
    }

    const recentRFQs = rfqs.slice(0, 5);
    const recentInvoices = invoices.slice(0, 5);

    return successResponse({
      stats: {
        pendingApprovals,
        activeRFQs,
        posThisMonth,
        invoicesOutstanding,
      },
      recentRFQs,
      recentInvoices,
    });
  }

  // ─── REPORTS & ANALYTICS ───────────────────────────────────────────────────
  if (url === '/reports/analytics' && method === 'get') {
    const pos = MockDatabase.getPurchaseOrders();
    const vendors = MockDatabase.getVendors();
    const rfqs = MockDatabase.getRFQs();
    const quotations = MockDatabase.getQuotations();
    const invoices = MockDatabase.getInvoices();

    // 1. Monthly spending
    const monthlySpendingMap: Record<string, number> = {};
    pos.forEach((po: any) => {
      const date = new Date(po.createdAt);
      const monthYear = date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
      monthlySpendingMap[monthYear] = (monthlySpendingMap[monthYear] || 0) + po.totalAmount;
    });
    
    const monthlySpending = Object.entries(monthlySpendingMap).map(([month, amount]) => ({
      month,
      amount,
    })).reverse();

    // 2. Vendor Performance
    const vendorPerformance = vendors.map((v: any) => {
      const participated = quotations.filter((q: any) => q.vendorId === v.id).length;
      const wins = quotations.filter((q: any) => q.vendorId === v.id && q.status === QuotationStatus.ACCEPTED).length;
      const winRate = participated > 0 ? Math.round((wins / participated) * 100) : 0;
      
      const vPos = pos.filter((p: any) => p.vendorId === v.id);
      const totalBilled = invoices.filter((i: any) => i.vendorId === v.id && i.status === InvoiceStatus.PAID).reduce((sum: number, i: any) => sum + i.totalAmount, 0);
      
      const avgDelivery = vPos.length > 0 
        ? Math.round(vPos.reduce((sum: number) => sum + 7, 0) / vPos.length)
        : 0;

      return {
        vendorName: v.name,
        totalRFQsParticipated: participated,
        winRate,
        avgDeliveryDays: avgDelivery || 7,
        totalBilled,
      };
    });

    // 3. Top 5 vendors by spend
    const topVendorsMap: Record<string, number> = {};
    pos.forEach((po: any) => {
      topVendorsMap[po.vendorName] = (topVendorsMap[po.vendorName] || 0) + po.totalAmount;
    });
    const topVendors = Object.entries(topVendorsMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 4. RFQ status breakdown
    const statusMap: Record<string, number> = { DRAFT: 0, PUBLISHED: 0, CLOSED: 0, CANCELLED: 0 };
    rfqs.forEach((r: any) => {
      statusMap[r.status] = (statusMap[r.status] || 0) + 1;
    });
    const rfqStatusBreakdown = Object.entries(statusMap).map(([name, value]) => ({
      name,
      value,
    }));

    return successResponse({
      monthlySpending,
      vendorPerformance,
      topVendors,
      rfqStatusBreakdown,
    });
  }

  return errorResponse(`Endpoint ${method.toUpperCase()} ${url} not implemented`, 501);
}

// Set the custom adapter
apiClient.defaults.adapter = mockAdapter;

export default apiClient;
