import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (_data: SignupFormValues) => {
    setIsLoading(true);
    // Simulate user creation
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Registration successful! Please login with your credentials.');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="auth-layout__card w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-primary tracking-tight">Create Account</h2>
        <p className="text-xs text-muted mt-1">Join VendorBridge ERP Procurement System</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">First Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <User size={16} />
              </span>
              <input
                type="text"
                {...register('firstName')}
                placeholder="Ananya"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary"
              />
            </div>
            {errors.firstName && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary mb-1">Last Name</label>
            <input
              type="text"
              {...register('lastName')}
              placeholder="Sharma"
              className="w-full px-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary"
            />
            {errors.lastName && (
              <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Mail size={16} />
            </span>
            <input
              type="email"
              {...register('email')}
              placeholder="name@company.com"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold text-primary mb-1">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Lock size={16} />
            </span>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1 group"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-muted font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Sign in here
        </Link>
      </div>
    </div>
  );
}
