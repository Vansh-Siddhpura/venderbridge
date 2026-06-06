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
  password: z.string().min(8, 'Use at least 8 characters'),
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
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Account request received. An administrator will contact you shortly.');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="auth-card">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Request an account</h1>
        <p className="mt-2 text-sm text-muted">
          Tell us a bit about yourself and we&apos;ll set you up.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label" htmlFor="firstName">First name</label>
            <div className="input-group">
              <span className="input-group__icon"><User size={16} /></span>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                placeholder="Ananya"
                className="input input--with-icon"
              />
            </div>
            {errors.firstName && <span className="input-error">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className="input-label" htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              placeholder="Sharma"
              className="input"
            />
            {errors.lastName && <span className="input-error">{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
          <label className="input-label" htmlFor="email">Work email</label>
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

        <div>
          <label className="input-label" htmlFor="password">Password</label>
          <div className="input-group">
            <span className="input-group__icon"><Lock size={16} /></span>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              placeholder="At least 8 characters"
              className="input input--with-icon"
            />
          </div>
          {errors.password && <span className="input-error">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn--primary btn--block"
        >
          {isLoading ? 'Submitting…' : 'Request account'}
          {!isLoading && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
