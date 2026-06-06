import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/enums';

// Layouts
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import LoginPage from '@/features/auth/LoginPage';
import SignupPage from '@/features/auth/SignupPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import VendorsPage from '@/features/vendors/VendorsPage';
import VendorCreatePage from '@/features/vendors/VendorCreatePage';
import VendorDetailPage from '@/features/vendors/VendorDetailPage';
import RFQsPage from '@/features/rfqs/RFQsPage';
import RFQCreatePage from '@/features/rfqs/RFQCreatePage';
import RFQDetailPage from '@/features/rfqs/RFQDetailPage';
import QuotationComparisonPage from '@/features/quotations/QuotationComparisonPage';
import ApprovalsPage from '@/features/approvals/ApprovalsPage';
import PurchaseOrdersPage from '@/features/purchase-orders/PurchaseOrdersPage';
import PODetailPage from '@/features/purchase-orders/PODetailPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import InvoiceDetailPage from '@/features/invoices/InvoiceDetailPage';
import ActivityLogsPage from '@/features/activity-logs/ActivityLogsPage';
import ReportsPage from '@/features/reports/ReportsPage';
import AdminUsersPage from '@/features/admin/AdminUsersPage';

import toast from 'react-hot-toast';

// ─── Route Guards ────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Show role guard notification
    setTimeout(() => {
      toast.error("You don't have access to this page");
    }, 100);
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ─── Route Definitions ───────────────────────────────────────────────────────

export const routes: RouteObject[] = [
  // Auth routes (public)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Protected app routes
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      
      // Vendors
      {
        path: '/vendors',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER]}>
            <VendorsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/vendors/new',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <VendorCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: '/vendors/:id',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER]}>
            <VendorDetailPage />
          </RoleGuard>
        ),
      },

      // RFQs & Quotations
      {
        path: '/rfqs',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER, UserRole.VENDOR]}>
            <RFQsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/rfqs/new',
        element: (
          <RoleGuard allowedRoles={[UserRole.PROCUREMENT_OFFICER, UserRole.ADMIN]}>
            <RFQCreatePage />
          </RoleGuard>
        ),
      },
      {
        path: '/rfqs/:id',
        element: <RFQDetailPage />,
      },
      {
        path: '/rfqs/:id/quotations',
        element: <QuotationComparisonPage />,
      },

      // Approvals (Manager, Admin)
      {
        path: '/approvals',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <ApprovalsPage />
          </RoleGuard>
        ),
      },

      // Purchase Orders
      {
        path: '/purchase-orders',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.VENDOR]}>
            <PurchaseOrdersPage />
          </RoleGuard>
        ),
      },
      {
        path: '/purchase-orders/:id',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.VENDOR]}>
            <PODetailPage />
          </RoleGuard>
        ),
      },

      // Invoices
      {
        path: '/invoices',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.VENDOR]}>
            <InvoicesPage />
          </RoleGuard>
        ),
      },
      {
        path: '/invoices/:id',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.VENDOR]}>
            <InvoiceDetailPage />
          </RoleGuard>
        ),
      },

      // Activity Logs (Admin, Manager)
      {
        path: '/activity-logs',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <ActivityLogsPage />
          </RoleGuard>
        ),
      },

      // Reports (Admin, Manager)
      {
        path: '/reports',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
            <ReportsPage />
          </RoleGuard>
        ),
      },

      // Admin Users (Admin only)
      {
        path: '/admin/users',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <AdminUsersPage />
          </RoleGuard>
        ),
      },
    ],
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
