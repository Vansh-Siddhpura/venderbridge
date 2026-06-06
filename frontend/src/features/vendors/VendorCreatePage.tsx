import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateVendorMutation } from './hooks/useVendors';
import { PageHeader } from '@/components/shared';
import { VendorStatus } from '@/types/enums';
import { Save, ArrowLeft } from 'lucide-react';

const vendorFormSchema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  category: z.string().min(2, 'Please select or specify a category'),
  gstNumber: z.string().regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GST Number format (e.g. 29AAAAA0000A1Z1)'
  ),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  notes: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

const CATEGORIES = [
  'IT Hardware & Networking',
  'Logistics & Shipping',
  'Office Stationery',
  'Raw Materials & Steel',
  'Facilities Maintenance',
  'Consulting Services',
];

export default function VendorCreatePage() {
  const navigate = useNavigate();
  const createVendorMutation = useCreateVendorMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
  });

  const onSubmit = (data: VendorFormValues) => {
    createVendorMutation.mutate(
      {
        ...data,
        status: VendorStatus.ACTIVE,
      },
      {
        onSuccess: () => {
          navigate('/vendors');
        },
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Add New Vendor"
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: 'New Vendor' },
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

      <div className="bg-surface border border-default rounded-lg max-w-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-primary mb-1">Company Name *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="Indo Global Logistics"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Category *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">GST Number *</label>
              <input
                type="text"
                {...register('gstNumber')}
                placeholder="29AAAAA0000A1Z1"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary uppercase"
              />
              {errors.gstNumber && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.gstNumber.message}</p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Contact Person *</label>
              <input
                type="text"
                {...register('contactPerson')}
                placeholder="Karan Malhotra"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
              />
              {errors.contactPerson && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.contactPerson.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Email *</label>
              <input
                type="email"
                {...register('email')}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">Phone *</label>
              <input
                type="text"
                {...register('phone')}
                placeholder="9876543210"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary"
              />
              {errors.phone && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-primary mb-1">Company Address *</label>
              <textarea
                {...register('address')}
                rows={3}
                placeholder="Plot 45, Sector 62, Noida, Uttar Pradesh"
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary resize-none"
              />
              {errors.address && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-primary mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="Additional notes about vendor rating, capability..."
                className="w-full px-3 py-2 text-sm rounded bg-surface border border-default text-primary focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-default">
            <button
              type="button"
              onClick={() => navigate('/vendors')}
              className="px-4 py-2 border border-default rounded text-sm font-semibold text-primary hover:bg-primary-light cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createVendorMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
