
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  
  const norm = status.toUpperCase();

  let colorClass = '';
  let dotColor = '';

  if (['DRAFT', 'PENDING', 'INVITED'].includes(norm)) {
    // Slate blue / gray shade
    colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    dotColor = 'bg-slate-400';
  } else if (['PUBLISHED', 'SUBMITTED', 'SENT'].includes(norm)) {
    // Medium light blue
    colorClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/50';
    dotColor = 'bg-blue-400';
  } else if (['SHORTLISTED', 'ACKNOWLEDGED'].includes(norm)) {
    // Sky blue
    colorClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-100 dark:border-sky-900/50';
    dotColor = 'bg-sky-400';
  } else if (['APPROVED', 'SELECTED', 'FULFILLED', 'PAID', 'ACCEPTED', 'ACTIVE'].includes(norm)) {
    // Vibrant brand blue (Primary)
    colorClass = 'bg-blue-600 text-white dark:bg-blue-900 dark:text-blue-100 border-blue-700 dark:border-blue-800';
    dotColor = 'bg-white dark:bg-blue-300';
  } else if (['REJECTED', 'CANCELLED', 'SUSPENDED', 'OVERDUE', 'BLACKLISTED', 'INACTIVE'].includes(norm)) {
    // Black in light mode, dark border-slate in dark mode
    colorClass = 'bg-black text-white dark:bg-slate-900 dark:text-slate-300 border-black dark:border-slate-800';
    dotColor = 'bg-slate-300 dark:bg-slate-500';
  } else if (['VIEWED', 'UNDER_REVIEW'].includes(norm)) {
    // Deep dark blue
    colorClass = 'bg-blue-950 text-blue-200 dark:bg-blue-950/80 dark:text-blue-200 border-blue-900';
    dotColor = 'bg-blue-300';
  } else {
    // Fallback
    colorClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
    dotColor = 'bg-blue-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${colorClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
