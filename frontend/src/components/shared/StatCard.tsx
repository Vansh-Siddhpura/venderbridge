import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, trend, hint }: StatCardProps) {
  const trendClass = trend?.direction === 'up' ? 'stat-card__trend--up' : 'stat-card__trend--down';

  return (
    <div className="stat-card">
      <div className="min-w-0 flex-1">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {trend && (
          <span className={`stat-card__trend ${trendClass}`}>
            {trend.direction === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{trend.value}</span>
            {hint && <span className="text-muted font-normal">&nbsp;{hint}</span>}
          </span>
        )}
        {!trend && hint && (
          <span className="stat-card__trend">{hint}</span>
        )}
      </div>
      <div className="stat-card__icon">
        <Icon size={18} />
      </div>
    </div>
  );
}
