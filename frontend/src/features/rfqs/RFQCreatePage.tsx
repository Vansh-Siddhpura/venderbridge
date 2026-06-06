import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateRFQMutation } from './hooks/useRFQs';
import { useVendorsQuery } from '@/features/vendors/hooks/useVendors';
import { PageHeader } from '@/components/shared';
import { VendorStatus } from '@/types/enums';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';

const rfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, 'Deadline must be in the future'),
  items: z
    .array(
      z.object({
        description: z.string().min(3, 'Item description is required'),
        quantity: z.number().positive('Quantity must be positive'),
        unit: z.string().min(1, 'Unit is required'),
        specifications: z.string().optional(),
      })
    )
    .min(1, 'Add at least one line item'),
  assignedVendors: z.array(z.string()).min(1, 'Assign at least one vendor'),
});

type RFQFormValues = z.infer<typeof rfqSchema>;

export default function RFQCreatePage() {
  const navigate = useNavigate();
  const createRFQMutation = useCreateRFQMutation();
  const { data: vendors = [], isLoading: vendorsLoading } = useVendorsQuery({
    status: VendorStatus.APPROVED,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RFQFormValues>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      items: [{ description: '', quantity: 1, unit: 'Units', specifications: '' }],
      assignedVendors: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = (data: RFQFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline).toISOString(),
      items: data.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        ...(it.specifications ? { specifications: { notes: it.specifications } } : {}),
      })),
      vendorIds: data.assignedVendors,
    };

    createRFQMutation.mutate(payload, {
      onSuccess: () => navigate('/rfqs'),
    });
  };

  return (
    <div>
      <PageHeader
        title="New request for quotation"
        subtitle="Add line items and assign vendors. You can publish the RFQ from the detail page."
        breadcrumbs={[
          { label: 'RFQs', href: '/rfqs' },
          { label: 'New' },
        ]}
        action={
          <button
            type="button"
            onClick={() => navigate('/rfqs')}
            className="btn btn--secondary"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-4xl">
        <div className="card__body space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="input-label" htmlFor="title">Title *</label>
                <input id="title" type="text" {...register('title')} placeholder="Office Hardware Refresh 2026" className="input" />
                {errors.title && <span className="input-error">{errors.title.message}</span>}
              </div>

              <div>
                <label className="input-label" htmlFor="deadline">Submission deadline *</label>
                <input id="deadline" type="datetime-local" {...register('deadline')} className="input" />
                {errors.deadline && <span className="input-error">{errors.deadline.message}</span>}
              </div>

              <div className="md:col-span-2">
                <label className="input-label" htmlFor="description">Scope &amp; description *</label>
                <textarea id="description" {...register('description')} rows={3} placeholder="Describe the scope of supply, deliverables and standards…" className="input" />
                {errors.description && <span className="input-error">{errors.description.message}</span>}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Line items *</h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unit: 'Units', specifications: '' })}
                className="btn btn--secondary btn--sm"
              >
                <Plus size={14} /> Add line
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-1 gap-3 rounded-lg border border-default bg-elevated p-3 md:grid-cols-12 md:items-end">
                  <div className="md:col-span-5">
                    <label className="input-label text-xs">Description</label>
                    <input type="text" {...register(`items.${idx}.description`)} placeholder="Laptops Core i7, 32GB RAM" className="input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label text-xs">Qty</label>
                    <input type="number" step="any" {...register(`items.${idx}.quantity`, { valueAsNumber: true })} className="input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label text-xs">Unit</label>
                    <input type="text" {...register(`items.${idx}.unit`)} placeholder="Units" className="input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label text-xs">Notes</label>
                    <input type="text" {...register(`items.${idx}.specifications`)} placeholder="Optional spec" className="input" />
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                      className="app-shell__icon-btn"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && (
              <p className="input-error">{errors.items.root?.message || errors.items.message}</p>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Assign vendors *</h3>

            {vendorsLoading ? (
              <p className="text-sm text-muted">Loading approved vendors…</p>
            ) : vendors.length === 0 ? (
              <p className="text-sm text-muted">No approved vendors available. Approve at least one vendor first.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor) => (
                  <label
                    key={vendor.id}
                    className="flex items-start gap-3 rounded-md border border-default bg-elevated p-3 transition hover:border-strong"
                  >
                    <input
                      type="checkbox"
                      value={vendor.id}
                      {...register('assignedVendors')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-primary">{vendor.name}</div>
                      <div className="text-xs text-muted">{vendor.category ?? 'Uncategorised'}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.assignedVendors && (
              <p className="input-error">{errors.assignedVendors.message}</p>
            )}
          </section>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            onClick={() => navigate('/rfqs')}
            className="btn btn--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createRFQMutation.isPending}
            className="btn btn--primary"
          >
            <Save size={16} />
            {createRFQMutation.isPending ? 'Creating…' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
}
