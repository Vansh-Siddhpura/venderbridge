import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const recoverySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
  });

  const onSubmit = async (_data: RecoveryFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Password reset instructions sent to your email.');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="auth-layout__card w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-primary tracking-tight">Recover Password</h2>
        <p className="text-xs text-muted mt-1">We will send reset link to your email</p>
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
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md bg-surface border border-default text-primary focus:outline-none focus:border-primary"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          {isLoading ? 'Sending Request...' : 'Send Recovery Email'}
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-muted font-medium flex items-center justify-center gap-1">
        <ArrowLeft size={12} />
        <Link to="/login" className="text-primary hover:underline font-bold">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
