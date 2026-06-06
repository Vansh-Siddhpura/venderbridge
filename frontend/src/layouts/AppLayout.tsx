import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
} from 'lucide-react';
import type { UserRole } from '@/types/enums';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Vendors',
    path: '/vendors',
    icon: <Building2 size={20} />,
  },
  {
    label: 'RFQs',
    path: '/rfqs',
    icon: <FileText size={20} />,
  },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: <CheckSquare size={20} />,
    allowedRoles: ['ADMIN' as UserRole, 'MANAGER' as UserRole],
  },
  {
    label: 'Purchase Orders',
    path: '/purchase-orders',
    icon: <ShoppingCart size={20} />,
  },
  {
    label: 'Invoices',
    path: '/invoices',
    icon: <Receipt size={20} />,
  },
  {
    label: 'Activity Logs',
    path: '/activity-logs',
    icon: <Activity size={20} />,
    allowedRoles: ['ADMIN' as UserRole, 'MANAGER' as UserRole],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: <BarChart3 size={20} />,
    allowedRoles: ['ADMIN' as UserRole, 'MANAGER' as UserRole],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return user?.role && item.allowedRoles.includes(user.role as UserRole);
  });

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="app-layout__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-layout__sidebar ${sidebarOpen ? '' : 'app-layout__sidebar--collapsed'} ${mobileOpen ? 'app-layout__sidebar--mobile-open' : ''}`}
      >
        <div className="app-layout__sidebar-header">
          <div className="app-layout__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#sidebar-gradient)" />
              <path d="M8 22L16 10L24 22H8Z" fill="white" fillOpacity="0.9" />
              <defs>
                <linearGradient id="sidebar-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            {sidebarOpen && <span className="app-layout__brand">VendorBridge</span>}
          </div>
          <button
            className="app-layout__collapse-btn desktop-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft
              size={18}
              style={{
                transform: sidebarOpen ? 'none' : 'rotate(180deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        </div>

        <nav className="app-layout__nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `app-layout__nav-link ${isActive ? 'app-layout__nav-link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="app-layout__nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="app-layout__nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="app-layout__sidebar-footer">
          <button className="app-layout__logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`app-layout__main ${sidebarOpen ? '' : 'app-layout__main--expanded'}`}>
        {/* Topbar */}
        <header className="app-layout__topbar">
          <button
            className="app-layout__mobile-toggle mobile-only"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="app-layout__topbar-spacer" />

          <div className="app-layout__user-info">
            <div className="app-layout__avatar">{userInitials}</div>
            <div className="app-layout__user-details desktop-only">
              <span className="app-layout__user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="app-layout__user-role">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
