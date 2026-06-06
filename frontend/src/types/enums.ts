export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  PROCUREMENT_OFFICER = 'PROCUREMENT_OFFICER',
  VIEWER = 'VIEWER', // kept for backwards compatibility with frontend code paths
  VENDOR = 'VENDOR',
}

export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum RFQStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum RFQVendorStatus {
  INVITED = 'INVITED',
  VIEWED = 'VIEWED',
  SUBMITTED = 'SUBMITTED',
  DECLINED = 'DECLINED',
}

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  SELECTED = 'SELECTED',
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_REVISION = 'REQUEST_REVISION',
}

export enum POStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}
