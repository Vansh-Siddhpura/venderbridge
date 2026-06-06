import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateVendorMutation } from './hooks/useVendors';
import { PageHeader } from '@/components/shared';
import { getVendorCategories } from '@/api/api';
import type { VendorCategory } from '@/types/api.types';
import { Save, ArrowLeft } from 'lucide-react';

const vendorFormSchema = z.object({
  name: z.string().min(3, 'Company name must be at least 3 characters'),
  categoryId: z.string().optional(),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GSTIN format (e.g. 29AAAAA0000A1Z1)'
    )
    .optional()
    .or(z.literal('')),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Use 10-digit Indian mobile number starting with 6-9')
    .optional()
    .or(z.literal('')),
  street: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Invalid 6-digit pincode'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  notes: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorCreatePage() {
  const navigate = useNavigate();
  const createVendorMutation = useCreateVendorMutation();
  const [categories, setCategories] = useState<VendorCategory[]>([]);

  useEffect(() => {
    getVendorCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

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
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        gstNumber: data.gstNumber || undefined,
        panNumber: data.pan || undefined,
        contactPerson: data.contactPerson,
        categoryId: data.categoryId || undefined,
        notes: data.notes || undefined,
        addressObj: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
        },
      },
      {
        onSuccess: () => navigate('/vendors'),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Add new vendor"
        subtitle="Vendors are created in PENDING state until an admin approves them."
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: 'New vendor' },
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

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-3xl">
        <div className="card__body grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="input-label" htmlFor="name">Company name *</label>
            <input id="name" {...register('name')} placeholder="e.g. Indo Global Logistics" className="input" />
            {errors.name && <span className="input-error">{errors.name.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="categoryId">Category</label>
            <select id="categoryId" {...register('categoryId')} className="input">
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="input-error">{errors.categoryId.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="contactPerson">Primary contact *</label>
            <input id="contactPerson" {...register('contactPerson')} placeholder="Karan Malhotra" className="input" />
            {errors.contactPerson && <span className="input-error">{errors.contactPerson.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="email">Email *</label>
            <input id="email" type="email" {...register('email')} placeholder="contact@company.com" className="input" />
            {errors.email && <span className="input-error">{errors.email.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="phone">Phone</label>
            <input id="phone" {...register('phone')} placeholder="9876543210" className="input" />
            {errors.phone && <span className="input-error">{errors.phone.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="gstNumber">GSTIN</label>
            <input
              id="gstNumber"
              {...register('gstNumber')}
              placeholder="29AAAAA0000A1Z1"
              className="input"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.gstNumber && <span className="input-error">{errors.gstNumber.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="pan">PAN</label>
            <input
              id="pan"
              {...register('pan')}
              placeholder="ABCDE1234F"
              className="input"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.pan && <span className="input-error">{errors.pan.message}</span>}
          </div>

          <div className="md:col-span-2">
            <label className="input-label" htmlFor="street">Street address *</label>
            <input id="street" {...register('street')} placeholder="Plot 45, Sector 62" className="input" />
            {errors.street && <span className="input-error">{errors.street.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="city">City *</label>
            <input id="city" {...register('city')} placeholder="Noida" className="input" />
            {errors.city && <span className="input-error">{errors.city.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="state">State *</label>
            <input id="state" {...register('state')} placeholder="Uttar Pradesh" className="input" />
            {errors.state && <span className="input-error">{errors.state.message}</span>}
          </div>

          <div>
            <label className="input-label" htmlFor="pincode">Pincode *</label>
            <input id="pincode" {...register('pincode')} placeholder="201301" className="input" />
            {errors.pincode && <span className="input-error">{errors.pincode.message}</span>}
          </div>

          <div className="md:col-span-2">
            <label className="input-label" htmlFor="notes">Internal notes</label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Capability, past relationship, references…"
              className="input"
            />
          </div>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="btn btn--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createVendorMutation.isPending}
            className="btn btn--primary"
          >
            <Save size={16} />
            {createVendorMutation.isPending ? 'Saving…' : 'Save vendor'}
          </button>
        </div>
      </form>
    </div>
  );
}
