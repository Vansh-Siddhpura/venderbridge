import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActivityLogsQuery } from './hooks/useActivityLogs';
import { PageHeader, Timeline, SearchFilter } from '@/components/shared';
import { Activity, FileText, ShoppingCart, Receipt, Building2 } from 'lucide-react';

const ENTITY_LABELS: Record<string, string> = {
  rfq: 'RFQ',
  quotation: 'Quotation',
  po: 'Purchase order',
  invoice: 'Invoice',
  vendor: 'Vendor',
  user: 'User',
};

export default function ActivityLogsPage() {
  const [entityFilter, setEntityFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const { data: logs = [], isLoading } = useActivityLogsQuery({
    entity: entityFilter,
    userName: userSearch,
  });

  const filterConfigs = [
    {
      key: 'entity',
      label: 'Entity',
      options: Object.entries(ENTITY_LABELS).map(([value, label]) => ({ label, value })),
    },
  ];

  const getEntityUrl = (entity: string, entityId?: string) => {
    if (!entityId) return null;
    switch (entity) {
      case 'rfq': return `/rfqs/${entityId}`;
      case 'quotation': return `/rfqs/${entityId}/quotations`;
      case 'po': return `/purchase-orders/${entityId}`;
      case 'invoice': return `/invoices/${entityId}`;
      case 'vendor': return `/vendors/${entityId}`;
      case 'user': return `/admin/users`;
      default: return null;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'rfq': return <FileText size={10} />;
      case 'po': return <ShoppingCart size={10} />;
      case 'invoice': return <Receipt size={10} />;
      case 'vendor': return <Building2 size={10} />;
      default: return <Activity size={10} />;
    }
  };

  const timelineEvents = logs.map((log: any) => {
    const url = getEntityUrl(log.entity, log.entityId);
    return {
      id: log.id,
      title: humanizeAction(log.action),
      timestamp: log.createdAt,
      user: log.userName,
      icon: getEntityIcon(log.entity),
      description: (
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-elevated px-2 py-0.5 text-xs text-secondary">
            {ENTITY_LABELS[log.entity] ?? log.entity}
          </span>
          {url && (
            <div>
              <Link
                to={url}
                className="text-xs font-medium text-brand hover:underline"
              >
                View related {ENTITY_LABELS[log.entity] ?? log.entity} &rarr;
              </Link>
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div>
      <PageHeader
        title="Activity log"
        subtitle="Append-only audit trail of every change in the system."
        breadcrumbs={[{ label: 'Insights' }, { label: 'Activity log' }]}
      />

      <SearchFilter
        onSearch={setUserSearch}
        onFilter={(_, val) => setEntityFilter(val)}
        filters={filterConfigs}
        placeholder="Filter by user…"
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="card card__body">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton mt-2 h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <Timeline events={timelineEvents} />
      )}
    </div>
  );
}

function humanizeAction(action: string): string {
  return action
    .split('.')
    .slice(1)
    .join(' ')
    .replace(/_/g, ' ')
    .replace(/^./, (m) => m.toUpperCase())
    || action;
}
