import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateRFQMutation } from './hooks/useRFQs';
import { useVendorsQuery } from '@/features/vendors/hooks/useVendors';
import { PageHeader } from '@/components/shared';
import { VendorStatus, RFQStatus } from '@/types/enums';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';

const rfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, 'Deadline must be a future date'),
  items: z.array(
    z.object({
      description: z.string().min(3, 'Item description is required'),
      quantity: z.number().positive('Quantity must be positive').int('Quantity must be an integer'),
      unit: z.string().min(1, 'Unit (e.g. Pcs, Reams) is required'),
      specifications: z.string().optional(),
    })
  ).min(1, 'Please add at least one line item'),
  assignedVendors: z.array(z.string()).min(1, 'Please assign at least one vendor'),
});

type RFQFormValues = z.infer<typeof rfqSchema>;

export default function RFQCreatePage() {
  const navigate = useNavigate();
  const createRFQMutation = useCreateRFQMutation();
  const { data: vendors = [] } = useVendorsQuery({ status: VendorStatus.ACTIVE });

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
    // Map assigned vendors to required payload structure
    const payload = {
      title: data.title,
      description: data.description,
      deadline: new Date(data.deadline).toISOString(),
      status: RFQStatus.PUBLISHED, // Auto-publish for test simplifications
      items: data.items,
      assignedVendors: data.assignedVendors.map((id) => ({ vendorId: id })),
    };

    createRFQMutation.mutate(payload, {
      onSuccess: () => {
        navigate('/rfqs');
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Create New RFQ"
        breadcrumbs={[
          { label: 'RFQs', href: '/rfqs' },
          { label: 'Create' },
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

      <div className="bg-surface border border-default rounded-lg max-w-4xl shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Section 1: Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
              RFQ Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-primary mb-1">RFQ Title *</label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g. Office Hardware Refresh 2026"
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                />
                {errors.title && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Submission Deadline *</label>
                <input
                  type="datetime-local"
                  {...register('deadline')}
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary cursor-pointer"
                />
                {errors.deadline && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.deadline.message}</p>
                )}
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-primary mb-1">Description & Scope *</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Detail the scope of supply, deliverable requirements, and standards..."
                  className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary resize-none"
                />
                {errors.description && (
                  <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Items */}
          <div className="space-y-4 pt-4 border-t border-default">
            <div className="flex justify-between items-center pb-2 border-b border-default">
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Line Items *</h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unit: 'Units', specifications: '' })}
                className="text-xs bg-primary-light text-primary hover:bg-primary/20 px-3 py-1.5 rounded font-bold uppercase flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-elevated/40 p-4 rounded-md border border-default relative">
                {/* Description */}
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-bold text-muted uppercase mb-1">Product Description</label>
                  <input
                    type="text"
                    {...register(`items.${idx}.description`)}
                    placeholder="Laptops Core i7, 32GB RAM"
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Qty */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase mb-1">Qty</label>
                  <input
                    type="number"
                    {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Unit */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase mb-1">Unit</label>
                  <input
                    type="text"
                    {...register(`items.${idx}.unit`)}
                    placeholder="Units"
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Specifications */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase mb-1">Specs (Opt)</label>
                  <input
                    type="text"
                    {...register(`items.${idx}.specifications`)}
                    placeholder="1TB SSD, 14-inch"
                    className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Remove Btn */}
                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    className="p-2 text-muted hover:text-black dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {errors.items && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.items.root?.message || errors.items.message}</p>
            )}
          </div>

          {/* Section 3: Assign Vendors */}
          <div className="space-y-4 pt-4 border-t border-default">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider pb-2 border-b border-default">
              Assign Approved Vendors *
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {vendors.map((vendor) => (
                <label
                  key={vendor.id}
                  className="flex items-center gap-3 p-3 bg-surface border border-default rounded-md hover:border-hover cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    value={vendor.id}
                    {...register('assignedVendors')}
                    className="h-4 w-4 rounded border-default text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-primary block">{vendor.name}</span>
                    <span className="text-[10px] text-muted block">{vendor.category}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.assignedVendors && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.assignedVendors.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-default">
            <button
              type="button"
              onClick={() => navigate('/rfqs')}
              className="px-4 py-2 border border-default rounded text-sm font-semibold text-primary hover:bg-primary-light cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRFQMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              Publish RFQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
