import { useParams, useNavigate } from 'react-router-dom';
import { useRFQDetailQuery, useUpdateRFQMutation } from './hooks/useRFQs';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge } from '@/components/shared';
import { RFQStatus, RFQVendorStatus } from '@/types/enums';
import { formatDate } from '@/utils/formatters';
import { ArrowLeft, FileSpreadsheet, Eye, Ban, Calendar, User, ClipboardList } from 'lucide-react';

export default function RFQDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isVendor, isProcurementOfficer, isAdmin } = useAuth();

  const { data: rfq, isLoading } = useRFQDetailQuery(id);
  const updateRFQMutation = useUpdateRFQMutation();

  const handleCloseRFQ = () => {
    updateRFQMutation.mutate({
      id,
      data: { status: RFQStatus.CLOSED },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!rfq) {
    return (
      <div className="text-center p-8 bg-surface border border-default rounded-lg">
        <p className="text-muted">RFQ not found.</p>
        <button
          onClick={() => navigate('/rfqs')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm cursor-pointer"
        >
          Back to RFQs
        </button>
      </div>
    );
  }

  // Check if current vendor has already responded
  const vendorResponse = rfq.assignedVendors?.find(
    (av: any) => av.vendorId === user?.vendorId
  );
  const hasResponded = vendorResponse?.status === RFQVendorStatus.RESPONDED;

  const showSubmitBtn = isVendor && rfq.status === RFQStatus.PUBLISHED;
  const showCompareBtn = !isVendor && rfq.status !== RFQStatus.DRAFT;
  const showCloseBtn = (isProcurementOfficer || isAdmin) && rfq.status === RFQStatus.PUBLISHED;

  return (
    <div>
      <PageHeader
        title={rfq.rfqNumber}
        breadcrumbs={[
          { label: 'RFQs', href: '/rfqs' },
          { label: 'Details' },
        ]}
        action={
          <button
            onClick={() => navigate('/rfqs')}
            className="px-4 py-2 border border-default rounded-md text-sm font-semibold text-primary hover:bg-primary-light flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details */}
        <div className="lg:col-span-2 bg-surface border border-default rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-default">
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Request details
              </span>
              <h2 className="text-xl font-bold text-primary mt-1">{rfq.title}</h2>
            </div>
            <StatusBadge status={rfq.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted" />
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Deadline</span>
                <span className="text-xs font-semibold text-primary block">
                  {formatDate(rfq.deadline)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-muted" />
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Created By</span>
                <span className="text-xs font-semibold text-primary block">{rfq.creatorName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Description</h4>
            <p className="text-xs text-primary leading-relaxed bg-elevated/20 p-3 rounded-md border border-default">
              {rfq.description || 'No description provided.'}
            </p>
          </div>

          {/* Line items list */}
          <div className="space-y-4 pt-4 border-t border-default">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList size={16} className="text-primary" />
              Items to procure ({rfq.items?.length || 0})
            </h4>
            <div className="border border-default rounded-lg overflow-hidden bg-surface">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-elevated border-b border-default text-muted font-bold">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-right">Quantity</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5">Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {rfq.items?.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-primary hover:bg-primary-light/10 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 font-medium">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-500">{item.specifications || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vendors assignment & status */}
        <div className="bg-surface border border-default rounded-lg p-6 shadow-sm h-fit space-y-6">
          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default mb-4">
              Vendors & Submissions
            </h3>
            
            {/* If vendor role is active: show submission status info */}
            {isVendor ? (
              <div className="space-y-3">
                <div className="p-4 bg-elevated/40 border border-default rounded-md text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted">Your Status:</span>
                    <StatusBadge status={vendorResponse?.status || 'PENDING'} />
                  </div>
                  {hasResponded && (
                    <p className="text-[10px] text-primary italic">
                      Response submitted on {formatDate(vendorResponse.respondedAt)}.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* If Admin/Manager/Officer: show all assigned vendors status */
              <div className="space-y-3">
                {rfq.assignedVendors?.map((v: any) => (
                  <div key={v.vendorId} className="flex justify-between items-center p-2 rounded bg-elevated/20 border border-default">
                    <div>
                      <span className="text-xs font-semibold text-primary block">
                        {v.vendorId === 'ven-1' ? 'TechCorp Solutions' : v.vendorId === 'ven-2' ? 'Indo Global Logistics' : 'Prism Office Supplies'}
                      </span>
                      {v.respondedAt && (
                        <span className="text-[9px] text-muted block">
                          Responded on {formatDate(v.respondedAt)}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-default">
            {showSubmitBtn && (
              <button
                onClick={() => navigate(`/rfqs/${rfq.id}/quotations`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                {hasResponded ? 'View / Edit Quotation' : 'Submit Quotation'}
              </button>
            )}

            {showCompareBtn && (
              <button
                onClick={() => navigate(`/rfqs/${rfq.id}/quotations`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye size={14} />
                Compare Quotations
              </button>
            )}

            {showCloseBtn && (
              <button
                onClick={handleCloseRFQ}
                disabled={updateRFQMutation.isPending}
                className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Ban size={14} />
                Close Bidding
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
