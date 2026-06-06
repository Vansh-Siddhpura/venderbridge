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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-default bg-surface p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-primary mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted max-w-sm mb-6">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
