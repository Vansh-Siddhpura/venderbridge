import { Navigate, type RouteObject } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/enums';

// Layouts
import AppLayout from '@/layouts/AppLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import VendorsPage from '@/features/vendors/VendorsPage';
import VendorDetailPage from '@/features/vendors/VendorDetailPage';
import RFQsPage from '@/features/rfqs/RFQsPage';
import RFQCreatePage from '@/features/rfqs/RFQCreatePage';
import QuotationComparisonPage from '@/features/quotations/QuotationComparisonPage';
import ApprovalsPage from '@/features/approvals/ApprovalsPage';
import PurchaseOrdersPage from '@/features/purchase-orders/PurchaseOrdersPage';
import InvoicesPage from '@/features/invoices/InvoicesPage';
import InvoiceDetailPage from '@/features/invoices/InvoiceDetailPage';
import ActivityLogsPage from '@/features/activity-logs/ActivityLogsPage';
import ReportsPage from '@/features/reports/ReportsPage';

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

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ─── Route Definitions ───────────────────────────────────────────────────────

export const routes: RouteObject[] = [
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
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
      {
        path: '/vendors',
        element: <VendorsPage />,
      },
      {
        path: '/vendors/:id',
        element: <VendorDetailPage />,
      },
      {
        path: '/rfqs',
        element: <RFQsPage />,
      },
      {
        path: '/rfqs/create',
        element: <RFQCreatePage />,
      },
      {
        path: '/quotations/compare/:rfqId',
        element: <QuotationComparisonPage />,
      },
      {
        path: '/approvals',
        element: (
          <RoleGuard allowedRoles={['ADMIN' as UserRole, 'MANAGER' as UserRole]}>
            <ApprovalsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/purchase-orders',
        element: <PurchaseOrdersPage />,
      },
      {
        path: '/invoices',
        element: <InvoicesPage />,
      },
      {
        path: '/invoices/:id',
        element: <InvoiceDetailPage />,
      },
      {
        path: '/activity-logs',
        element: (
          <RoleGuard allowedRoles={['ADMIN' as UserRole, 'MANAGER' as UserRole]}>
            <ActivityLogsPage />
          </RoleGuard>
        ),
      },
      {
        path: '/reports',
        element: (
          <RoleGuard allowedRoles={['ADMIN' as UserRole, 'MANAGER' as UserRole]}>
            <ReportsPage />
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
