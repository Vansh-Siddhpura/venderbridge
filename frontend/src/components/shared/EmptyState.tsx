interface EmptyStateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title || 'No data found'}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {children}
    </div>
  );
}
