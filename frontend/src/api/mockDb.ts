import { UserRole, VendorStatus, RFQStatus, RFQVendorStatus, QuotationStatus, ApprovalAction, POStatus, InvoiceStatus } from '@/types/enums';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  vendorId?: string; // Linked vendor for VENDOR role
  createdAt: string;
  updatedAt: string;
}

export interface MockVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  contactPerson: string;
  category: string;
  status: VendorStatus;
  rating: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockRFQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface MockRFQVendor {
  vendorId: string;
  status: RFQVendorStatus;
  respondedAt?: string;
}

export interface MockRFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  status: RFQStatus;
  deadline: string;
  createdBy: string;
  creatorName: string;
  items: MockRFQItem[];
  assignedVendors: MockRFQVendor[];
  createdAt: string;
  updatedAt: string;
}

export interface MockQuotationItem {
  rfqItemId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number; // GST percentage (e.g. 18)
  totalPrice: number; // (unitPrice * quantity) * (1 + taxRate/100)
}

export interface MockQuotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  status: QuotationStatus;
  items: MockQuotationItem[];
  totalAmount: number;
  deliveryDays: number;
  notes?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockApproval {
  id: string;
  rfqId?: string;
  poId?: string;
  invoiceId?: string;
  quotationId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: ApprovalAction;
  comments: string;
  actedAt?: string;
  createdAt: string;
}

export interface MockPurchaseOrderItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface MockPurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGst: string;
  status: POStatus;
  totalAmount: number;
  shippingAddress: string;
  terms: string;
  expectedDelivery: string;
  issuedAt?: string;
  items: MockPurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MockInvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGst: string;
  purchaseOrderId: string;
  poNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number; // Total CGST + SGST
  totalAmount: number; // Net amount (subtotal + tax)
  dueDate: string;
  paidAt?: string;
  notes?: string;
  items: MockInvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MockActivityLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

// ─── Initial Seed Data ────────────────────────────────────────────────────────
const SEED_USERS: MockUser[] = [
  {
    id: 'usr-admin',
    email: 'admin@vendorbridge.com',
    passwordHash: 'admin123', // Raw password for simple mock login validation
    firstName: 'Ananya',
    lastName: 'Sharma',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'usr-officer',
    email: 'officer@vendorbridge.com',
    passwordHash: 'officer123',
    firstName: 'Rahul',
    lastName: 'Varma',
    role: UserRole.PROCUREMENT_OFFICER,
    isActive: true,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'usr-manager',
    email: 'manager@vendorbridge.com',
    passwordHash: 'manager123',
    firstName: 'Vikram',
    lastName: 'Sen',
    role: UserRole.MANAGER,
    isActive: true,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'usr-vendor1',
    email: 'vendor1@vendorbridge.com',
    passwordHash: 'vendor123',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: UserRole.VENDOR,
    isActive: true,
    vendorId: 'ven-1',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'usr-vendor2',
    email: 'vendor2@vendorbridge.com',
    passwordHash: 'vendor222',
    firstName: 'Sanjay',
    lastName: 'Mehta',
    role: UserRole.VENDOR,
    isActive: true,
    vendorId: 'ven-2',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
];

const SEED_VENDORS: MockVendor[] = [
  {
    id: 'ven-1',
    name: 'TechCorp Solutions',
    email: 'sales@techcorp.com',
    phone: '9876543210',
    address: '102 Outer Ring Road, Mahadevapura, Bengaluru, Karnataka',
    gstNumber: '29AAAAA0000A1Z1',
    contactPerson: 'Rajesh Kumar',
    category: 'IT Hardware & Networking',
    status: VendorStatus.ACTIVE,
    rating: 4.8,
    notes: 'Premium supplier for office hardware and infrastructure support.',
    createdAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'ven-2',
    name: 'Indo Global Logistics',
    email: 'info@indoglobal.com',
    phone: '8765432109',
    address: 'Plot 45, Sector 62, Noida, Uttar Pradesh',
    gstNumber: '09BBBBB1111B1Z2',
    contactPerson: 'Sanjay Mehta',
    category: 'Logistics & Shipping',
    status: VendorStatus.ACTIVE,
    rating: 4.2,
    notes: 'National logistics network. Excellent delivery timelines.',
    createdAt: '2026-05-12T11:30:00Z',
    updatedAt: '2026-05-12T11:30:00Z',
  },
  {
    id: 'ven-3',
    name: 'Prism Office Supplies',
    email: 'prism@prism.com',
    phone: '7654321098',
    address: 'B-12 Connaught Place, New Delhi, Delhi',
    gstNumber: '07CCCCC2222C1Z3',
    contactPerson: 'Karan Malhotra',
    category: 'Office Stationery',
    status: VendorStatus.ACTIVE,
    rating: 3.9,
    notes: 'Provides bulk supply of basic pantry and stationery items.',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-15T09:00:00Z',
  },
  {
    id: 'ven-4',
    name: 'Apollo Steel Works',
    email: 'contact@apollo.com',
    phone: '9123456789',
    address: 'Block G-4, MIDC Industrial Area, Bhosari, Pune, Maharashtra',
    gstNumber: '27DDDDD3333D1Z4',
    contactPerson: 'Sunita Patil',
    category: 'Raw Materials & Steel',
    status: VendorStatus.ACTIVE,
    rating: 4.5,
    notes: 'High grade carbon steel plates and alloy bar components.',
    createdAt: '2026-05-20T14:15:00Z',
    updatedAt: '2026-05-20T14:15:00Z',
  },
  {
    id: 'ven-5',
    name: 'Vertex Enterprises',
    email: 'vertex@vertex.com',
    phone: '6543210987',
    address: 'EP Block, Salt Lake Sector V, Kolkata, West Bengal',
    gstNumber: '19EEEEE4444E1Z5',
    contactPerson: 'Debashis Roy',
    category: 'Facilities Maintenance',
    status: VendorStatus.BLACKLISTED,
    rating: 2.1,
    notes: 'Suspended due to repeated delivery delays and poor communication.',
    createdAt: '2026-05-22T16:00:00Z',
    updatedAt: '2026-05-22T16:00:00Z',
  },
];

const SEED_RFQS: MockRFQ[] = [
  {
    id: 'rfq-1',
    rfqNumber: 'RFQ-000001',
    title: 'Office IT Equipment Procurement',
    description: 'Procurement of high performance developer laptops, 4K monitors, and docks.',
    status: RFQStatus.PUBLISHED,
    deadline: '2026-06-25T18:30:00Z',
    createdBy: 'usr-officer',
    creatorName: 'Rahul Varma',
    items: [
      { id: 'item-1', description: 'Developer Laptops (Core i7, 32GB RAM, 1TB SSD)', quantity: 15, unit: 'Units' },
      { id: 'item-2', description: 'Dell 27-inch 4K Monitors (U2723QE)', quantity: 20, unit: 'Units' },
      { id: 'item-3', description: 'Triple Display USB-C Docking Stations', quantity: 15, unit: 'Units' },
    ],
    assignedVendors: [
      { vendorId: 'ven-1', status: RFQVendorStatus.RESPONDED, respondedAt: '2026-06-03T10:00:00Z' },
      { vendorId: 'ven-2', status: RFQVendorStatus.RESPONDED, respondedAt: '2026-06-04T12:00:00Z' },
      { vendorId: 'ven-3', status: RFQVendorStatus.PENDING },
    ],
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'rfq-2',
    rfqNumber: 'RFQ-000002',
    title: 'Annual Stationery Bulk Supply',
    description: 'Bulk paper, folders, diaries, writing utensils for corporate offices.',
    status: RFQStatus.CLOSED,
    deadline: '2026-06-05T18:30:00Z',
    createdBy: 'usr-officer',
    creatorName: 'Rahul Varma',
    items: [
      { id: 'item-4', description: 'A4 Copier Paper Reams (75 GSM)', quantity: 300, unit: 'Reams' },
      { id: 'item-5', description: 'Premium Leather Diaries with logo imprint', quantity: 100, unit: 'Units' },
    ],
    assignedVendors: [
      { vendorId: 'ven-3', status: RFQVendorStatus.RESPONDED, respondedAt: '2026-06-02T11:00:00Z' },
    ],
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-06-05T18:35:00Z',
  },
  {
    id: 'rfq-3',
    rfqNumber: 'RFQ-000003',
    title: 'Structural Steel Plates Supply',
    description: 'Supply of structural steel plates for warehouse reinforcement project.',
    status: RFQStatus.DRAFT,
    deadline: '2026-07-10T18:30:00Z',
    createdBy: 'usr-admin',
    creatorName: 'Ananya Sharma',
    items: [
      { id: 'item-6', description: 'Structural Carbon Steel Plates 10mm x 2m x 6m', quantity: 50, unit: 'Sheets' },
    ],
    assignedVendors: [
      { vendorId: 'ven-4', status: RFQVendorStatus.PENDING },
    ],
    createdAt: '2026-06-05T12:00:00Z',
    updatedAt: '2026-06-05T12:00:00Z',
  },
];

const SEED_QUOTATIONS: MockQuotation[] = [
  {
    id: 'qte-1',
    quotationNumber: 'QTN-000001',
    rfqId: 'rfq-1',
    rfqTitle: 'Office IT Equipment Procurement',
    vendorId: 'ven-1',
    vendorName: 'TechCorp Solutions',
    status: QuotationStatus.SUBMITTED,
    items: [
      { rfqItemId: 'item-1', description: 'Developer Laptops (Core i7, 32GB RAM, 1TB SSD)', quantity: 15, unit: 'Units', unitPrice: 78000, taxRate: 18, totalPrice: 1380600 },
      { rfqItemId: 'item-2', description: 'Dell 27-inch 4K Monitors (U2723QE)', quantity: 20, unit: 'Units', unitPrice: 32000, taxRate: 18, totalPrice: 755200 },
      { rfqItemId: 'item-3', description: 'Triple Display USB-C Docking Stations', quantity: 15, unit: 'Units', unitPrice: 8500, taxRate: 18, totalPrice: 150450 },
    ],
    totalAmount: 2286250, // Sum of total prices (including GST)
    deliveryDays: 7,
    notes: 'Pricing includes standard 1 year on-site warranty. Ready for immediate dispatch.',
    submittedAt: '2026-06-03T10:00:00Z',
    createdAt: '2026-06-03T09:45:00Z',
    updatedAt: '2026-06-03T10:00:00Z',
  },
  {
    id: 'qte-2',
    quotationNumber: 'QTN-000002',
    rfqId: 'rfq-1',
    rfqTitle: 'Office IT Equipment Procurement',
    vendorId: 'ven-2',
    vendorName: 'Indo Global Logistics',
    status: QuotationStatus.SUBMITTED,
    items: [
      { rfqItemId: 'item-1', description: 'Developer Laptops (Core i7, 32GB RAM, 1TB SSD)', quantity: 15, unit: 'Units', unitPrice: 76500, taxRate: 18, totalPrice: 1354050 },
      { rfqItemId: 'item-2', description: 'Dell 27-inch 4K Monitors (U2723QE)', quantity: 20, unit: 'Units', unitPrice: 33500, taxRate: 18, totalPrice: 790600 },
      { rfqItemId: 'item-3', description: 'Triple Display USB-C Docking Stations', quantity: 15, unit: 'Units', unitPrice: 9000, taxRate: 18, totalPrice: 159300 },
    ],
    totalAmount: 2303950,
    deliveryDays: 12,
    notes: 'We can manage shipping directly to your multiple facilities with no extra charge.',
    submittedAt: '2026-06-04T12:00:00Z',
    createdAt: '2026-06-04T11:15:00Z',
    updatedAt: '2026-06-04T12:00:00Z',
  },
  {
    id: 'qte-3',
    quotationNumber: 'QTN-000003',
    rfqId: 'rfq-2',
    rfqTitle: 'Annual Stationery Bulk Supply',
    vendorId: 'ven-3',
    vendorName: 'Prism Office Supplies',
    status: QuotationStatus.ACCEPTED,
    items: [
      { rfqItemId: 'item-4', description: 'A4 Copier Paper Reams (75 GSM)', quantity: 300, unit: 'Reams', unitPrice: 280, taxRate: 12, totalPrice: 94080 },
      { rfqItemId: 'item-5', description: 'Premium Leather Diaries with logo imprint', quantity: 100, unit: 'Units', unitPrice: 450, taxRate: 12, totalPrice: 50400 },
    ],
    totalAmount: 144480,
    deliveryDays: 5,
    notes: 'Includes custom logo debossing on the diaries.',
    submittedAt: '2026-06-02T11:00:00Z',
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-05T18:40:00Z',
  },
];

const SEED_PURCHASE_ORDERS: MockPurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-000001',
    rfqId: 'rfq-2',
    quotationId: 'qte-3',
    vendorId: 'ven-3',
    vendorName: 'Prism Office Supplies',
    vendorEmail: 'prism@prism.com',
    vendorPhone: '7654321098',
    vendorAddress: 'B-12 Connaught Place, New Delhi, Delhi',
    vendorGst: '07CCCCC2222C1Z3',
    status: POStatus.ISSUED,
    totalAmount: 144480,
    shippingAddress: 'VendorBridge Headquarters, Outer Ring Road, Bengaluru',
    terms: 'Payment due within 30 days of invoice receipt.',
    expectedDelivery: '2026-06-15T00:00:00Z',
    issuedAt: '2026-06-05T19:00:00Z',
    items: [
      { description: 'A4 Copier Paper Reams (75 GSM)', quantity: 300, unit: 'Reams', unitPrice: 280, totalPrice: 84000 },
      { description: 'Premium Leather Diaries with logo imprint', quantity: 100, unit: 'Units', unitPrice: 450, totalPrice: 45000 },
    ],
    createdAt: '2026-06-05T18:50:00Z',
    updatedAt: '2026-06-05T19:00:00Z',
  },
];

const SEED_INVOICES: MockInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-000001',
    vendorId: 'ven-3',
    vendorName: 'Prism Office Supplies',
    vendorEmail: 'prism@prism.com',
    vendorPhone: '7654321098',
    vendorAddress: 'B-12 Connaught Place, New Delhi, Delhi',
    vendorGst: '07CCCCC2222C1Z3',
    purchaseOrderId: 'po-1',
    poNumber: 'PO-000001',
    status: InvoiceStatus.SUBMITTED,
    subtotal: 129000,
    taxAmount: 15480, // 12% GST
    totalAmount: 144480,
    dueDate: '2026-07-05T00:00:00Z',
    items: [
      { description: 'A4 Copier Paper Reams (75 GSM)', hsnCode: '4802', quantity: 300, unit: 'Reams', unitPrice: 280, taxRate: 12, taxAmount: 10080, totalPrice: 94080 },
      { description: 'Premium Leather Diaries with logo imprint', hsnCode: '4820', quantity: 100, unit: 'Units', unitPrice: 450, taxRate: 12, taxAmount: 5400, totalPrice: 50400 },
    ],
    notes: 'Thank you for your business. Please process payment to HDFC Bank A/c: 502000012345.',
    createdAt: '2026-06-06T09:00:00Z',
    updatedAt: '2026-06-06T09:00:00Z',
  },
];

const SEED_APPROVALS: MockApproval[] = [
  {
    id: 'app-1',
    quotationId: 'qte-3',
    rfqId: 'rfq-2',
    userId: 'usr-manager',
    userName: 'Vikram Sen',
    userRole: UserRole.MANAGER,
    action: ApprovalAction.APPROVED,
    comments: 'Selected vendor Prism Office Supplies. The pricing is competitive and includes required custom branding.',
    actedAt: '2026-06-05T18:40:00Z',
    createdAt: '2026-06-05T18:35:00Z',
  },
];

const SEED_LOGS: MockActivityLog[] = [
  { id: 'log-1', userName: 'Rahul Varma', action: 'Created RFQ', entity: 'RFQ', entityId: 'rfq-1', details: 'Created RFQ-000001: Office IT Equipment Procurement', createdAt: '2026-06-01T10:00:00Z' },
  { id: 'log-2', userName: 'Rajesh Kumar', action: 'Submitted Quotation', entity: 'Quotation', entityId: 'qte-1', details: 'Submitted QTN-000001 for RFQ-000001. Amount: ₹22,86,250.00', createdAt: '2026-06-03T10:00:00Z' },
  { id: 'log-3', userName: 'Sanjay Mehta', action: 'Submitted Quotation', entity: 'Quotation', entityId: 'qte-2', details: 'Submitted QTN-000002 for RFQ-000001. Amount: ₹23,03,950.00', createdAt: '2026-06-04T12:00:00Z' },
  { id: 'log-4', userName: 'Vikram Sen', action: 'Approved Quotation', entity: 'Quotation', entityId: 'qte-3', details: 'Approved QTN-000003 for RFQ-000002. Remarks: Selected vendor Prism Office Supplies.', createdAt: '2026-06-05T18:40:00Z' },
  { id: 'log-5', userName: 'Rahul Varma', action: 'Issued Purchase Order', entity: 'PurchaseOrder', entityId: 'po-1', details: 'Issued PO-000001 to Prism Office Supplies. Total: ₹1,44,480.00', createdAt: '2026-06-05T19:00:00Z' },
];

const SEED_SEQUENCES = {
  rfq: 3,
  qtn: 3,
  po: 1,
  inv: 1,
  log: 5,
};

// ─── DB Implementation ────────────────────────────────────────────────────────
export class MockDatabase {
  private static getStore<T>(key: string, seed: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  }

  private static setStore<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private static getNextSequence(type: 'rfq' | 'qtn' | 'po' | 'inv' | 'log'): string {
    const seqData = localStorage.getItem('vendorbridge_db_sequences');
    const seqs = seqData ? JSON.parse(seqData) : SEED_SEQUENCES;
    seqs[type] += 1;
    localStorage.setItem('vendorbridge_db_sequences', JSON.stringify(seqs));

    const prefix = type.toUpperCase();
    const num = seqs[type].toString().padStart(6, '0');
    return `${prefix}-${num}`;
  }

  // Getters
  public static getUsers(): MockUser[] { return this.getStore('vendorbridge_db_users', SEED_USERS); }
  public static getVendors(): MockVendor[] { return this.getStore('vendorbridge_db_vendors', SEED_VENDORS); }
  public static getRFQs(): MockRFQ[] { return this.getStore('vendorbridge_db_rfqs', SEED_RFQS); }
  public static getQuotations(): MockQuotation[] { return this.getStore('vendorbridge_db_quotations', SEED_QUOTATIONS); }
  public static getPurchaseOrders(): MockPurchaseOrder[] { return this.getStore('vendorbridge_db_purchase_orders', SEED_PURCHASE_ORDERS); }
  public static getInvoices(): MockInvoice[] { return this.getStore('vendorbridge_db_invoices', SEED_INVOICES); }
  public static getApprovals(): MockApproval[] { return this.getStore('vendorbridge_db_approvals', SEED_APPROVALS); }
  public static getLogs(): MockActivityLog[] { return this.getStore('vendorbridge_db_logs', SEED_LOGS); }

  // Mutations
  public static saveUsers(users: MockUser[]): void { this.setStore('vendorbridge_db_users', users); }
  public static saveVendors(vendors: MockVendor[]): void { this.setStore('vendorbridge_db_vendors', vendors); }
  public static saveRFQs(rfqs: MockRFQ[]): void { this.setStore('vendorbridge_db_rfqs', rfqs); }
  public static saveQuotations(qtes: MockQuotation[]): void { this.setStore('vendorbridge_db_quotations', qtes); }
  public static savePurchaseOrders(pos: MockPurchaseOrder[]): void { this.setStore('vendorbridge_db_purchase_orders', pos); }
  public static saveInvoices(invs: MockInvoice[]): void { this.setStore('vendorbridge_db_invoices', invs); }
  public static saveApprovals(apps: MockApproval[]): void { this.setStore('vendorbridge_db_approvals', apps); }
  public static saveLogs(logs: MockActivityLog[]): void { this.setStore('vendorbridge_db_logs', logs); }

  public static addLog(userName: string, action: string, entity: string, entityId?: string, details?: string): void {
    const logs = this.getLogs();
    const newLog: MockActivityLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      userName,
      action,
      entity,
      entityId,
      details,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog); // Prepend so latest is first
    this.saveLogs(logs);
  }

  // Custom Operations
  public static createRFQ(rfqData: Partial<MockRFQ>, creator: MockUser): MockRFQ {
    const rfqs = this.getRFQs();
    const rfqNumber = this.getNextSequence('rfq');
    
    const newRFQ: MockRFQ = {
      id: `rfq-${Math.random().toString(36).substr(2, 9)}`,
      rfqNumber,
      title: rfqData.title || '',
      description: rfqData.description || '',
      status: rfqData.status || RFQStatus.DRAFT,
      deadline: rfqData.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: creator.id,
      creatorName: `${creator.firstName} ${creator.lastName}`,
      items: (rfqData.items || []).map((item, idx) => ({
        id: `item-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        specifications: item.specifications || '',
      })),
      assignedVendors: (rfqData.assignedVendors || []).map(v => ({
        vendorId: v.vendorId,
        status: RFQVendorStatus.PENDING,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    rfqs.unshift(newRFQ);
    this.saveRFQs(rfqs);

    this.addLog(newRFQ.creatorName, 'Created RFQ', 'RFQ', newRFQ.id, `Created ${newRFQ.rfqNumber}: ${newRFQ.title}`);
    return newRFQ;
  }

  public static submitQuotation(qteData: Partial<MockQuotation>, vendorUser: MockUser): MockQuotation {
    const qtes = this.getQuotations();
    const qtnNumber = this.getNextSequence('qtn');
    
    const vendor = this.getVendors().find(v => v.id === vendorUser.vendorId);
    const vendorName = vendor ? vendor.name : 'Unknown Vendor';

    const items = (qteData.items || []).map(item => {
      const taxAmount = (item.unitPrice * item.quantity) * (item.taxRate / 100);
      const totalPrice = (item.unitPrice * item.quantity) + taxAmount;
      return {
        ...item,
        totalPrice,
      } as MockQuotationItem;
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const newQte: MockQuotation = {
      id: `qte-${Math.random().toString(36).substr(2, 9)}`,
      quotationNumber: qtnNumber,
      rfqId: qteData.rfqId || '',
      rfqTitle: qteData.rfqTitle || '',
      vendorId: vendorUser.vendorId || '',
      vendorName,
      status: qteData.status || QuotationStatus.SUBMITTED,
      items,
      totalAmount,
      deliveryDays: qteData.deliveryDays || 7,
      notes: qteData.notes || '',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    qtes.unshift(newQte);
    this.saveQuotations(qtes);

    // Update RFQ vendor list status to RESPODNED
    const rfqs = this.getRFQs();
    const rfq = rfqs.find(r => r.id === newQte.rfqId);
    if (rfq) {
      const assigned = rfq.assignedVendors.find(v => v.vendorId === newQte.vendorId);
      if (assigned) {
        assigned.status = RFQVendorStatus.RESPONDED;
        assigned.respondedAt = new Date().toISOString();
        rfq.updatedAt = new Date().toISOString();
        this.saveRFQs(rfqs);
      }
    }

    this.addLog(`${vendorUser.firstName} ${vendorUser.lastName}`, 'Submitted Quotation', 'Quotation', newQte.id, `Submitted ${newQte.quotationNumber} for RFQ: ${newQte.rfqTitle}. Total Amount: ₹${totalAmount.toLocaleString('en-IN')}`);
    return newQte;
  }

  public static approveQuotation(qteId: string, comments: string, manager: MockUser): MockQuotation {
    const qtes = this.getQuotations();
    const qte = qtes.find(q => q.id === qteId);
    if (!qte) throw new Error('Quotation not found');

    qte.status = QuotationStatus.ACCEPTED;
    qte.updatedAt = new Date().toISOString();
    this.saveQuotations(qtes);

    // Reject all other quotations for this RFQ
    const updatedQtes = qtes.map(q => {
      if (q.rfqId === qte.rfqId && q.id !== qteId) {
        return {
          ...q,
          status: QuotationStatus.REJECTED,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });
    this.saveQuotations(updatedQtes);

    // Close the RFQ
    const rfqs = this.getRFQs();
    const rfq = rfqs.find(r => r.id === qte.rfqId);
    if (rfq) {
      rfq.status = RFQStatus.CLOSED;
      rfq.updatedAt = new Date().toISOString();
      this.saveRFQs(rfqs);
    }

    // Save Approval
    const approvals = this.getApprovals();
    const newApproval: MockApproval = {
      id: `app-${Math.random().toString(36).substr(2, 9)}`,
      quotationId: qte.id,
      rfqId: qte.rfqId,
      userId: manager.id,
      userName: `${manager.firstName} ${manager.lastName}`,
      userRole: manager.role,
      action: ApprovalAction.APPROVED,
      comments,
      actedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    approvals.push(newApproval);
    this.saveApprovals(approvals);

    // Log it
    this.addLog(`${manager.firstName} ${manager.lastName}`, 'Approved Quotation', 'Quotation', qte.id, `Approved ${qte.quotationNumber} for RFQ: ${qte.rfqTitle}. Remarks: ${comments}`);

    // Generate Purchase Order automatically
    this.generatePurchaseOrder(qte, manager);

    return qte;
  }

  public static rejectQuotation(qteId: string, comments: string, manager: MockUser): MockQuotation {
    const qtes = this.getQuotations();
    const qte = qtes.find(q => q.id === qteId);
    if (!qte) throw new Error('Quotation not found');

    qte.status = QuotationStatus.REJECTED;
    qte.updatedAt = new Date().toISOString();
    this.saveQuotations(qtes);

    // Save Approval (Rejection)
    const approvals = this.getApprovals();
    const newApproval: MockApproval = {
      id: `app-${Math.random().toString(36).substr(2, 9)}`,
      quotationId: qte.id,
      rfqId: qte.rfqId,
      userId: manager.id,
      userName: `${manager.firstName} ${manager.lastName}`,
      userRole: manager.role,
      action: ApprovalAction.REJECTED,
      comments,
      actedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    approvals.push(newApproval);
    this.saveApprovals(approvals);

    // Log it
    this.addLog(`${manager.firstName} ${manager.lastName}`, 'Rejected Quotation', 'Quotation', qte.id, `Rejected ${qte.quotationNumber} for RFQ: ${qte.rfqTitle}. Remarks: ${comments}`);

    return qte;
  }

  private static generatePurchaseOrder(qte: MockQuotation, _manager: MockUser): MockPurchaseOrder {
    const pos = this.getPurchaseOrders();
    const poNumber = this.getNextSequence('po');
    const vendor = this.getVendors().find(v => v.id === qte.vendorId);

    const newPO: MockPurchaseOrder = {
      id: `po-${Math.random().toString(36).substr(2, 9)}`,
      poNumber,
      rfqId: qte.rfqId,
      quotationId: qte.id,
      vendorId: qte.vendorId,
      vendorName: qte.vendorName,
      vendorEmail: vendor?.email || '',
      vendorPhone: vendor?.phone || '',
      vendorAddress: vendor?.address || '',
      vendorGst: vendor?.gstNumber || '',
      status: POStatus.ISSUED,
      totalAmount: qte.totalAmount,
      shippingAddress: 'VendorBridge Headquarters, Outer Ring Road, Bengaluru',
      terms: 'Payment due within 30 days of invoice receipt.',
      expectedDelivery: new Date(Date.now() + qte.deliveryDays * 24 * 60 * 60 * 1000).toISOString(),
      issuedAt: new Date().toISOString(),
      items: qte.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pos.unshift(newPO);
    this.savePurchaseOrders(pos);

    this.addLog('System', 'Generated Purchase Order', 'PurchaseOrder', newPO.id, `Auto-generated ${newPO.poNumber} for selected quote ${qte.quotationNumber}`);
    return newPO;
  }

  public static updatePOStatus(poId: string, status: POStatus, user: MockUser): MockPurchaseOrder {
    const pos = this.getPurchaseOrders();
    const po = pos.find(p => p.id === poId);
    if (!po) throw new Error('PO not found');

    po.status = status;
    po.updatedAt = new Date().toISOString();
    this.savePurchaseOrders(pos);

    this.addLog(`${user.firstName} ${user.lastName}`, 'Updated PO Status', 'PurchaseOrder', po.id, `Updated status of ${po.poNumber} to ${status}`);
    return po;
  }

  public static createInvoiceFromPO(poId: string, notes: string, vendorUser: MockUser): MockInvoice {
    const pos = this.getPurchaseOrders();
    const po = pos.find(p => p.id === poId);
    if (!po) throw new Error('Purchase Order not found');

    const invs = this.getInvoices();
    const invoiceNumber = this.getNextSequence('inv');

    // Calculate subtotal, taxes (18% flat for mock items)
    const items: MockInvoiceItem[] = po.items.map((item, idx) => {
      const sub = item.unitPrice * item.quantity;
      const taxRate = 18; // default GST
      const tax = sub * (taxRate / 100);
      return {
        description: item.description,
        hsnCode: `HSN-847${idx}`,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        taxRate,
        taxAmount: tax,
        totalPrice: sub + tax,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + taxAmount;

    const newInvoice: MockInvoice = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      vendorEmail: po.vendorEmail,
      vendorPhone: po.vendorPhone,
      vendorAddress: po.vendorAddress,
      vendorGst: po.vendorGst,
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      status: InvoiceStatus.SUBMITTED,
      subtotal,
      taxAmount,
      totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invs.unshift(newInvoice);
    this.saveInvoices(invs);

    // Mark PO status as DELIVERED/FULFILLED if needed, or update PO references
    po.status = POStatus.DELIVERED;
    po.updatedAt = new Date().toISOString();
    this.savePurchaseOrders(pos);

    this.addLog(`${vendorUser.firstName} ${vendorUser.lastName}`, 'Created Invoice', 'Invoice', newInvoice.id, `Created invoice ${newInvoice.invoiceNumber} for ${po.poNumber}`);
    return newInvoice;
  }

  public static updateInvoiceStatus(invoiceId: string, status: InvoiceStatus, user: MockUser): MockInvoice {
    const invs = this.getInvoices();
    const inv = invs.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    inv.status = status;
    if (status === InvoiceStatus.PAID) {
      inv.paidAt = new Date().toISOString();
    }
    inv.updatedAt = new Date().toISOString();
    this.saveInvoices(invs);

    this.addLog(`${user.firstName} ${user.lastName}`, 'Updated Invoice Status', 'Invoice', inv.id, `Updated status of ${inv.invoiceNumber} to ${status}`);
    return inv;
  }
}
