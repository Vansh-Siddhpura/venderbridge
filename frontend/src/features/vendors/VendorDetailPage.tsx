import { useParams, useNavigate } from 'react-router-dom';
import { useVendorDetailQuery, useUpdateVendorMutation } from './hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge } from '@/components/shared';
import { VendorStatus } from '@/types/enums';
import { ArrowLeft, CheckCircle, ShieldAlert, Phone, Mail, MapPin, Award } from 'lucide-react';

export default function VendorDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: vendor, isLoading } = useVendorDetailQuery(id);
  const updateVendorMutation = useUpdateVendorMutation();

  const handleUpdateStatus = (newStatus: VendorStatus) => {
    updateVendorMutation.mutate({
      id,
      data: { status: newStatus },
    });
  };

  if (isLoading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!vendor) {
    return (
      <div className="text-center p-8 bg-surface border border-default rounded-lg">
        <p className="text-muted">Vendor not found.</p>
        <button
          onClick={() => navigate('/vendors')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm cursor-pointer"
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={vendor.name}
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: 'Details' },
        ]}
        action={
          <button
            onClick={() => navigate('/vendors')}
            className="px-4 py-2 border border-default rounded-md text-sm font-semibold text-primary hover:bg-primary-light flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Card */}
        <div className="lg:col-span-2 bg-surface border border-default rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-default">
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                {vendor.category}
              </span>
              <h2 className="text-xl font-bold text-primary mt-1">{vendor.name}</h2>
            </div>
            <StatusBadge status={vendor.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-muted block uppercase">GST Number</span>
                <span className="text-sm font-semibold text-primary block mt-0.5 select-all">
                  {vendor.gstNumber || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-muted block uppercase">Contact Person</span>
                <span className="text-sm font-semibold text-primary block mt-0.5">
                  {vendor.contactPerson || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-2">
                <Award size={16} className="text-primary" />
                <span>Vendor Quality Rating: <strong>{vendor.rating ? vendor.rating.toFixed(1) : '0.0'} / 5.0</strong></span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2.5 items-start">
                <MapPin size={18} className="text-muted shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-muted block uppercase">Address</span>
                  <span className="text-sm text-primary block mt-0.5">{vendor.address || 'N/A'}</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-center">
                <Mail size={18} className="text-muted" />
                <div>
                  <span className="text-xs font-bold text-muted block uppercase">Email Address</span>
                  <a href={`mailto:${vendor.email}`} className="text-sm text-blue-500 hover:underline block mt-0.5 select-all">
                    {vendor.email}
                  </a>
                </div>
              </div>
              <div className="flex gap-2.5 items-center">
                <Phone size={18} className="text-muted" />
                <div>
                  <span className="text-xs font-bold text-muted block uppercase">Phone Number</span>
                  <span className="text-sm text-primary block mt-0.5 select-all">{vendor.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {vendor.notes && (
            <div className="bg-elevated p-4 rounded-md border border-default">
              <span className="text-xs font-bold text-muted block uppercase mb-1">Internal Notes</span>
              <p className="text-xs text-primary leading-relaxed">{vendor.notes}</p>
            </div>
          )}
        </div>

        {/* Administration Actions Panel */}
        <div className="bg-surface border border-default rounded-lg p-6 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
            Vendor Administration
          </h3>
          
          <p className="text-xs text-muted leading-relaxed">
            Manage vendor listing statuses and access logs. Restricting a vendor prevents them from participating in new RFQ bids.
          </p>

          {isAdmin ? (
            <div className="space-y-2 pt-2">
              {vendor.status !== VendorStatus.ACTIVE && (
                <button
                  onClick={() => handleUpdateStatus(VendorStatus.ACTIVE)}
                  disabled={updateVendorMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  Approve / Activate Vendor
                </button>
              )}
              {vendor.status !== VendorStatus.BLACKLISTED && (
                <button
                  onClick={() => handleUpdateStatus(VendorStatus.BLACKLISTED)}
                  disabled={updateVendorMutation.isPending}
                  className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-md font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert size={14} />
                  Blacklist / Suspend
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-elevated border border-default rounded text-[11px] text-muted font-medium text-center">
              Only Administrator accounts have permissions to update status records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
