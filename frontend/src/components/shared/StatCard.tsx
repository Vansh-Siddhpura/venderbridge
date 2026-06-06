import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  const isUp = trend?.direction === 'up';

  return (
    <div className="bg-surface border border-default p-5 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md hover:border-hover transition-all">
      <div className="flex-1">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
          {label}
        </span>
        <span className="text-2xl font-bold text-primary block leading-none">
          {value}
        </span>
        {trend && (
          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-muted">
            {isUp ? (
              <ArrowUpRight size={14} className="text-primary" />
            ) : (
              <ArrowDownRight size={14} className="text-black dark:text-slate-400" />
            )}
            <span className={isUp ? 'text-primary font-bold' : 'text-primary'}>
              {trend.value}
            </span>{' '}
            since last month
          </span>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary ml-4 shrink-0">
        <Icon size={22} />
      </div>
    </div>
  );
}
