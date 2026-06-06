import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { loginUser } from '@/api/api';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const QUICK_PROFILES = [
  { label: 'Admin', email: 'admin@vendorbridge.com', pass: 'admin123' },
  { label: 'Officer', email: 'officer@vendorbridge.com', pass: 'officer123' },
  { label: 'Manager', email: 'manager@vendorbridge.com', pass: 'manager123' },
  { label: 'Vendor', email: 'vendor1@vendorbridge.com', pass: 'vendor123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      login(response.user, response.accessToken);
      toast.success(`Welcome back, ${response.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
    onSubmit({ email, password: pass });
  };

  return (
    <div className="auth-layout__card w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-primary tracking-tight">Sign In</h2>
        <p className="text-xs text-muted mt-1">Access VendorBridge Procurement Portal</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-primary">Password</label>
            <Link
              to="/forgot-password"
              className="text-[10px] text-primary hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Lock size={16} />
            </span>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light"
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
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1 group"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </form>

      {/* Quick Presets */}
      <div className="mt-6 border-t border-default pt-4">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-2 text-center">
          Demo Presets
        </span>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_PROFILES.map((profile) => (
            <button
              key={profile.label}
              type="button"
              onClick={() => handleQuickLogin(profile.email, profile.pass)}
              className="px-2 py-1.5 rounded bg-surface border border-default text-xs font-semibold text-primary hover:bg-primary-light hover:border-primary transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Shield size={12} className="text-primary" />
              {profile.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-muted font-medium">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline font-bold">
          Register here
        </Link>
      </div>
    </div>
  );
}
