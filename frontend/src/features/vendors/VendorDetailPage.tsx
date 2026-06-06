import { useParams, useNavigate } from 'react-router-dom';
import { useVendorDetailQuery, useUpdateVendorMutation } from './hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, LoadingSkeleton, StatusBadge } from '@/components/shared';
import { VendorStatus } from '@/types/enums';
import { ArrowLeft, CheckCircle2, Ban, Phone, Mail, MapPin, Star } from 'lucide-react';

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

  if (isLoading) return <LoadingSkeleton type="detail" />;

  if (!vendor) {
    return (
      <div className="card card__body text-center">
        <p className="text-muted">Vendor not found.</p>
        <button
          type="button"
          onClick={() => navigate('/vendors')}
          className="btn btn--primary mt-4"
        >
          Back to vendors
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={vendor.name}
        subtitle={vendor.category}
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.name },
        ]}
        action={
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="btn btn--secondary"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">Company information</h2>
              <StatusBadge status={vendor.status} />
            </div>
            <div className="card__body grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="GSTIN" value={vendor.gstNumber} />
              <Field label="PAN" value={vendor.panNumber} />
              <Field label="Contact person" value={vendor.contactPerson} />
              <Field
                label="Rating"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Star size={14} className="text-warning" fill="currentColor" />
                    {vendor.rating ? vendor.rating.toFixed(1) : '—'} / 5.0
                  </span>
                }
              />
              <Field
                label="Email"
                icon={<Mail size={14} />}
                value={
                  vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="text-brand hover:underline">
                      {vendor.email}
                    </a>
                  )
                }
              />
              <Field
                label="Phone"
                icon={<Phone size={14} />}
                value={vendor.phone}
              />
              <Field
                label="Address"
                icon={<MapPin size={14} />}
                value={vendor.address}
                fullWidth
              />
            </div>
          </div>

          {vendor.notes && (
            <div className="card">
              <div className="card__header">
                <h2 className="card__title">Internal notes</h2>
              </div>
              <div className="card__body">
                <p className="text-sm leading-relaxed text-secondary whitespace-pre-line">{vendor.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit">
          <div className="card__header">
            <h2 className="card__title">Administration</h2>
          </div>
          <div className="card__body space-y-3">
            <p className="text-sm text-muted">
              Move this vendor through the approval lifecycle. Suspended vendors
              cannot participate in new RFQs.
            </p>

            {isAdmin ? (
              <div className="flex flex-col gap-2">
                {vendor.status !== VendorStatus.APPROVED && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(VendorStatus.APPROVED)}
                    disabled={updateVendorMutation.isPending}
                    className="btn btn--primary btn--block"
                  >
                    <CheckCircle2 size={16} />
                    Approve vendor
                  </button>
                )}
                {vendor.status !== VendorStatus.REJECTED && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(VendorStatus.REJECTED)}
                    disabled={updateVendorMutation.isPending}
                    className="btn btn--secondary btn--block"
                  >
                    Reject application
                  </button>
                )}
                {vendor.status !== VendorStatus.SUSPENDED && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(VendorStatus.SUSPENDED)}
                    disabled={updateVendorMutation.isPending}
                    className="btn btn--danger btn--block"
                  >
                    <Ban size={16} />
                    Suspend vendor
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-default bg-elevated p-3 text-xs text-muted">
                Only administrators can change vendor status.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  fullWidth,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : undefined}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-primary">
        {value || <span className="text-muted">—</span>}
      </div>
    </div>
  );
}
