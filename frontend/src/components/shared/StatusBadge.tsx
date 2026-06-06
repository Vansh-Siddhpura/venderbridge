interface StatusBadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      {status || 'StatusBadge'}
    </span>
  );
}
