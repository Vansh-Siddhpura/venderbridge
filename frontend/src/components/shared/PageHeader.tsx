import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs = [], action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted font-medium">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {crumb.href && !isLast ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-primary font-semibold' : ''}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={12} className="text-muted opacity-60" />}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {title}
        </h1>
      </div>
      {action && <div className="flex items-center gap-2 mt-2 md:mt-0">{action}</div>}
    </div>
  );
}
