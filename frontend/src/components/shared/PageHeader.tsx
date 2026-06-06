import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs = [], action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="page-header__crumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {crumb.href && !isLast ? (
                    <Link to={crumb.href} className="page-header__crumb-link">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-secondary font-medium' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={12} className="text-subtle" />}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
