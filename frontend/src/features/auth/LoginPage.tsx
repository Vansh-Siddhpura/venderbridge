import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { loginUser } from '@/api/api';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// These match the credentials produced by `npx prisma db seed`
const QUICK_PROFILES = [
  { label: 'Admin', email: 'admin@vendorbridge.com', pass: 'Admin@123' },
  { label: 'Manager', email: 'manager@vendorbridge.com', pass: 'Manager@123' },
  { label: 'Officer', email: 'officer@vendorbridge.com', pass: 'Officer@123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Login failed. Please try again.');
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
    <div className="auth-card">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Sign in to VendorBridge</h1>
        <p className="mt-2 text-sm text-muted">
          Welcome back. Enter your credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="input-label" htmlFor="email">Work email</label>
          <div className="input-group">
            <span className="input-group__icon">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="you@company.com"
              className="input input--with-icon"
            />
          </div>
          {errors.email && <span className="input-error">{errors.email.message}</span>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="input-label mb-0" htmlFor="password">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="input-group">
            <span className="input-group__icon">
              <Lock size={16} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              placeholder="Enter your password"
              className="input input--with-icon pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded text-subtle hover:text-primary hover:bg-muted"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn--primary btn--block"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
          {!isLoading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="mt-6 border-t border-default pt-5">
        <p className="mb-2 text-center text-xs font-medium text-muted">
          Try a demo account
        </p>
        <div className="grid grid-cols-3 gap-2">
          {QUICK_PROFILES.map((profile) => (
            <button
              key={profile.label}
              type="button"
              onClick={() => handleQuickLogin(profile.email, profile.pass)}
              disabled={isLoading}
              className="btn btn--secondary btn--sm"
            >
              {profile.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        New to VendorBridge?{' '}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
