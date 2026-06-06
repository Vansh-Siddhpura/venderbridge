import { Outlet } from 'react-router-dom';
import { ShieldCheck, BarChart3, Users } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__hero">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <path d="M6 24L16 8L26 24H6Z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">VendorBridge</span>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Run procurement with clarity and control.
          </h2>
          <p className="text-base leading-relaxed text-indigo-200/90">
            A single workspace for vendor onboarding, RFQs, quotations,
            approvals, purchase orders and invoices &mdash; built for procurement
            teams that need traceability.
          </p>

          <ul className="space-y-3 text-sm text-indigo-100/90">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
                <Users size={14} />
              </span>
              Manage vendors, categories and approvals in one place.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
                <ShieldCheck size={14} />
              </span>
              Role-based access for admins, officers, managers and vendors.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
                <BarChart3 size={14} />
              </span>
              Audit trail and analytics for every procurement decision.
            </li>
          </ul>
        </div>

        <p className="text-xs text-indigo-200/60">
          &copy; {new Date().getFullYear()} VendorBridge. Procurement, simplified.
        </p>
      </aside>

      <main className="auth-shell__form">
        <Outlet />
      </main>
    </div>
  );
}
