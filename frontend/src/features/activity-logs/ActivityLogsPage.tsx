import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useActivityLogsQuery } from './hooks/useActivityLogs';
import { PageHeader, Timeline, SearchFilter } from '@/components/shared';
import { Activity, FileText, ShoppingCart, Receipt, Building2 } from 'lucide-react';

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
      label: 'Entity Type',
      options: [
        { label: 'RFQ', value: 'RFQ' },
        { label: 'Quotation', value: 'Quotation' },
        { label: 'Purchase Order', value: 'PurchaseOrder' },
        { label: 'Invoice', value: 'Invoice' },
        { label: 'Vendor', value: 'Vendor' },
        { label: 'User', value: 'User' },
      ],
    },
  ];

  // Helper to map entity links
  const getEntityUrl = (entity: string, entityId: string) => {
    switch (entity) {
      case 'RFQ':
        return `/rfqs/${entityId}`;
      case 'Quotation':
        // Quotation link points to the RFQ comparison page
        return `/rfqs/${entityId}/quotations`;
      case 'PurchaseOrder':
        return `/purchase-orders/${entityId}`;
      case 'Invoice':
        return `/invoices/${entityId}`;
      case 'Vendor':
        return `/vendors/${entityId}`;
      case 'User':
        return `/admin/users`;
      default:
        return '#';
    }
  };

  // Helper to map entity icons
  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'RFQ':
        return <FileText size={10} />;
      case 'PurchaseOrder':
        return <ShoppingCart size={10} />;
      case 'Invoice':
        return <Receipt size={10} />;
      case 'Vendor':
        return <Building2 size={10} />;
      default:
        return <Activity size={10} />;
    }
  };

  // Format logs for Timeline component
  const timelineEvents = logs.map((log) => {
    const linkUrl = log.entityId ? getEntityUrl(log.entity, log.entityId) : null;
    
    return {
      id: log.id,
      title: log.action,
      timestamp: log.createdAt,
      user: log.userName,
      icon: getEntityIcon(log.entity),
      description: (
        <div className="space-y-1">
          <p className="text-xs text-primary">{log.details}</p>
          {linkUrl && (
            <Link
              to={linkUrl}
              className="inline-flex items-center text-[10px] font-bold text-blue-500 hover:underline mt-1 uppercase tracking-wider"
            >
              View Linked {log.entity.replace(/([A-Z])/g, ' $1').trim()} &rarr;
            </Link>
          )}
        </div>
      ) as any,
    };
  });

  return (
    <div>
      <PageHeader
        title="System Activity Logs"
        breadcrumbs={[{ label: 'Admin', href: '#' }, { label: 'Activity Logs' }]}
      />

      <SearchFilter
        onSearch={setUserSearch}
        onFilter={(_, val) => setEntityFilter(val)}
        filters={filterConfigs}
        placeholder="Filter logs by username..."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-surface border border-default rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="max-w-3xl">
          <Timeline events={timelineEvents} />
        </div>
      )}
    </div>
  );
}
