'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../api';
import { BackButton } from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { TextField } from '../../components/ui/TextField';
import { ArrowRightIcon, ShieldIcon } from '../../components/ui/icons';
import { sessionQueryKey } from './useSession';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid business email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: (values) => api.auth.login(values),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session);
      router.push('/dashboard');
    },
  });

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 font-sans relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Background ambient spotlight */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[450px] w-[700px] opacity-15 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, var(--color-brand-600) 0%, transparent 70%)',
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Navigation & Logo */}
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/" />
          <Link href="/" className="inline-block transition-opacity hover:opacity-90">
            <LogoWithWordmark size={30} />
          </Link>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl border p-8 shadow-2xl transition-all"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border-subtle)',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Sign in to Kimana
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Enter your corporate credentials to access your business console
            </p>
          </div>

          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
            <TextField
              label="Business Email Address"
              type="email"
              placeholder="name@company.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="Password"
              type="password"
              placeholder="••••••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--color-brand-600)' }}
                />
                Remember this device
              </label>

              <span className="font-medium hover:opacity-80 cursor-pointer" style={{ color: 'var(--color-brand-400)' }}>
                Forgot password?
              </span>
            </div>

            {mutation.isError ? (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
                {mutation.error?.message || 'We couldn’t sign you in. Check your details and try again.'}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full py-3 text-base font-bold mt-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Signing in…' : 'Sign in'} <ArrowRightIcon size={16} />
            </Button>
          </form>

          {/* Security Badge */}
          <div className="mt-8 border-t pt-6 flex items-center justify-center gap-2 text-xs" style={{ borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}>
            <ShieldIcon size={14} color="var(--color-brand-400)" />
            <span>256-bit Encrypted CBN Compliant Session</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Don’t have a business profile yet?{' '}
          <Link href="/onboarding/business-details" className="font-bold hover:opacity-80" style={{ color: 'var(--color-brand-400)' }}>
            Get started here
          </Link>
        </div>
      </div>
    </div>
  );
}
