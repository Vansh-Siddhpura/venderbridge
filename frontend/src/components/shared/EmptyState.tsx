import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon size={20} />
      </div>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__description">{description}</p>
      {action}
    </div>
  );
}
