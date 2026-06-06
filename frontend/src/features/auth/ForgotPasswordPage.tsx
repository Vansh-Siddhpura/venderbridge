import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const recoverySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type RecoveryFormValues = z.infer<typeof recoverySchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

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
      setSubmitted(true);
      toast.success('If that email is registered, we&apos;ve sent a reset link.');
    }, 600);
  };

  return (
    <div className="auth-card">
      <div className="mb-8">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the email associated with your account and we&apos;ll send a link to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-default bg-elevated p-4 text-sm text-secondary">
          If <strong>that email</strong> matches an account, you&apos;ll receive a password reset link within a few minutes.
          Be sure to check spam folders.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="email">Email</label>
            <div className="input-group">
              <span className="input-group__icon"><Mail size={16} /></span>
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn--primary btn--block"
          >
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  );
}
