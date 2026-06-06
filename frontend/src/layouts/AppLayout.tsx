import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import {
  LayoutDashboard,
  Building2,
  FileText,
  CheckSquare,
  ShoppingCart,
  Receipt,
  Activity,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon,
  Users,
} from 'lucide-react';
import { UserRole } from '@/types/enums';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Procurement',
    items: [
      { label: 'Vendors', path: '/vendors', icon: <Building2 size={18} />, allowedRoles: [UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER] },
      { label: 'RFQs', path: '/rfqs', icon: <FileText size={18} /> },
      { label: 'Approvals', path: '/approvals', icon: <CheckSquare size={18} />, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER] },
      { label: 'Purchase Orders', path: '/purchase-orders', icon: <ShoppingCart size={18} /> },
      { label: 'Invoices', path: '/invoices', icon: <Receipt size={18} /> },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Reports', path: '/reports', icon: <BarChart3 size={18} />, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER] },
      { label: 'Activity Logs', path: '/activity-logs', icon: <Activity size={18} />, allowedRoles: [UserRole.ADMIN, UserRole.MANAGER] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Users', path: '/admin/users', icon: <Users size={18} />, allowedRoles: [UserRole.ADMIN] },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  VENDOR: 'Vendor',
  VIEWER: 'Viewer',
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAllowed = (item: NavItem): boolean => {
    if (!item.allowedRoles) return true;
    return !!user?.role && item.allowedRoles.includes(user.role as UserRole);
  };

  const visibleGroups = NAV_GROUPS
    .map((g) => ({ ...g, items: g.items.filter(isAllowed) }))
    .filter((g) => g.items.length > 0);

  const userInitials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
    : 'U';

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          className="app-shell__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          'app-shell__sidebar',
          !sidebarOpen ? 'app-shell__sidebar--collapsed' : '',
          mobileOpen ? 'app-shell__sidebar--mobile-open' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="app-shell__sidebar-header">
          <div className="app-shell__brand">
            <span className="app-shell__brand-mark" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M6 24L16 8L26 24H6Z" fill="currentColor" />
              </svg>
            </span>
            {sidebarOpen && <span>VendorBridge</span>}
          </div>
          <button
            type="button"
            className="app-shell__icon-btn desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft
              size={16}
              style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 200ms' }}
            />
          </button>
        </div>

        <nav className="app-shell__nav">
          {visibleGroups.map((group, idx) => (
            <div key={idx}>
              {group.label && sidebarOpen && (
                <div className="app-shell__nav-group-label">{group.label}</div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `app-shell__nav-link ${isActive ? 'app-shell__nav-link--active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="app-shell__sidebar-footer">
          <button
            type="button"
            className="app-shell__nav-link w-full"
            onClick={handleLogout}
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="app-shell__topbar">
          <button
            type="button"
            className="app-shell__icon-btn mobile-only"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={toggleTheme}
            className="app-shell__icon-btn"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-default">
            <div className="app-shell__avatar">{userInitials}</div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-primary">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-muted">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </span>
            </div>
          </div>
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
