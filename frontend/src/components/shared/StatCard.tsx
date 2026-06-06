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
    <div className="glass-card stat-card-premium flex items-center justify-between">
      <div className="flex-1 relative z-10">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
          {label}
        </span>
        <span className="text-3xl font-extrabold text-primary block leading-none tracking-tight">
          {value}
        </span>
        {trend && (
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-muted">
            {isUp ? (
              <ArrowUpRight size={16} className="text-success" />
            ) : (
              <ArrowDownRight size={16} className="text-error" />
            )}
            <span className={isUp ? 'text-success font-bold' : 'text-error font-bold'}>
              {trend.value}
            </span>{' '}
            since last month
          </span>
        )}
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white ml-4 shrink-0 shadow-md relative z-10">
        <Icon size={24} />
      </div>
    </div>
  );
}
