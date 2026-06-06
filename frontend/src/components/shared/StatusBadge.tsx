interface StatusBadgeProps {
  status?: string | null;
}

type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const TONE_MAP: Record<string, Tone> = {
  // Success / accepted / paid
  APPROVED: 'success',
  ACCEPTED: 'success',
  SELECTED: 'success',
  FULFILLED: 'success',
  DELIVERED: 'success',
  PAID: 'success',
  ACTIVE: 'success',

  // In progress / under review
  PUBLISHED: 'info',
  SUBMITTED: 'info',
  SENT: 'info',
  SHORTLISTED: 'info',
  ACKNOWLEDGED: 'info',
  UNDER_REVIEW: 'info',
  PARTIALLY_DELIVERED: 'info',
  ISSUED: 'info',
  RESPONDED: 'info',
  VIEWED: 'info',

  // Pending / draft / invited
  PENDING: 'warning',
  DRAFT: 'neutral',
  INVITED: 'neutral',
  NO_RESPONSE: 'neutral',
  INACTIVE: 'neutral',

  // Rejected / cancelled / suspended / blacklisted / overdue / disputed
  REJECTED: 'error',
  DECLINED: 'error',
  CANCELLED: 'error',
  SUSPENDED: 'error',
  BLACKLISTED: 'error',
  OVERDUE: 'error',
  DISPUTED: 'error',
};

const humanize = (s: string) =>
  s.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;
  const norm = status.toUpperCase();
  const tone: Tone = TONE_MAP[norm] ?? 'neutral';

  return (
    <span className={`badge badge--${tone}`}>
      <span className="badge__dot" />
      {humanize(status)}
    </span>
  );
}
