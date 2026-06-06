
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  
  const norm = status.toUpperCase();

  let modifierClass = '';
  let dotColorClass = '';

  if (['DRAFT', 'PENDING', 'INVITED'].includes(norm)) {
    modifierClass = 'status-badge--default';
    dotColorClass = 'bg-slate-400';
  } else if (['PUBLISHED', 'SUBMITTED', 'SENT', 'VIEWED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACKNOWLEDGED'].includes(norm)) {
    modifierClass = 'status-badge--info';
    dotColorClass = 'bg-blue-500';
  } else if (['APPROVED', 'SELECTED', 'FULFILLED', 'PAID', 'ACCEPTED', 'ACTIVE'].includes(norm)) {
    modifierClass = 'status-badge--success';
    dotColorClass = 'bg-emerald-500';
  } else if (['REJECTED', 'CANCELLED', 'SUSPENDED', 'OVERDUE', 'BLACKLISTED', 'INACTIVE'].includes(norm)) {
    modifierClass = 'status-badge--error';
    dotColorClass = 'bg-red-500';
  } else {
    modifierClass = 'status-badge--default';
    dotColorClass = 'bg-slate-400';
  }

  return (
    <span className={`status-badge ${modifierClass} inline-flex items-center gap-1.5`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`} />
      {status}
    </span>
  );
}
