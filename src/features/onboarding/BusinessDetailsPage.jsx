'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { businessDetailsCopy, businessTypeOptions, industryOptions, nigerianStates } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const businessTypeValues = businessTypeOptions.map((o) => o.value);
const industryValues = industryOptions.map((o) => o.value);

const schema = z
  .object({
    email: z.string().trim().email('Enter a valid business email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    legalName: z.string().trim().min(2, 'Enter your registered business name.'),
    cacNumber: z
      .string()
      .trim()
      .regex(/^RC-?\d{4,8}$/i, 'Enter a valid RC number, e.g. RC-1234567.'),
    businessType: z.enum(businessTypeValues, { message: 'Select your business type.' }),
    industry: z.enum(industryValues, { message: 'Select your industry.' }),
    state: z.string().min(1, 'Select your primary state of operation.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export function BusinessDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: application?.business?.email ?? '',
      password: application?.business?.password ?? '',
      confirmPassword: application?.business?.password ?? '',
      legalName: application?.business?.legalName ?? '',
      cacNumber: application?.business?.cacNumber ?? '',
      businessType: application?.business?.businessType,
      industry: application?.business?.industry,
      state: application?.business?.tradingAddress.state ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values) => {
      if (!application) throw new Error('Application not loaded yet');
      return api.onboarding.saveBusinessDetails(application.id, {
        email: values.email,
        password: values.password,
        legalName: values.legalName,
        cacNumber: values.cacNumber.toUpperCase(),
        businessType: values.businessType,
        industry: values.industry,
        tradingAddress: { state: values.state, country: 'NG' },
        countryOfIncorporation: 'NG',
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(onboardingQueryKey, updated);
      router.push('/onboarding/directors-ubo');
    },
  });

  return (
    <OnboardingLayout stepIndex={0} title={businessDetailsCopy.title} subtitle={businessDetailsCopy.subtitle}>
      <form className="space-y-6" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        {/* Account & Auth Credentials */}
        <div
          className="space-y-4 rounded-xl border p-5"
          style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {businessDetailsCopy.authSectionTitle}
          </h2>
          <TextField
            label={businessDetailsCopy.email.label}
            type="email"
            placeholder={businessDetailsCopy.email.placeholder}
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label={businessDetailsCopy.password.label}
              type="password"
              placeholder={businessDetailsCopy.password.placeholder}
              error={errors.password?.message}
              {...register('password')}
            />
            <TextField
              label={businessDetailsCopy.confirmPassword.label}
              type="password"
              placeholder={businessDetailsCopy.confirmPassword.placeholder}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-5">
          <TextField
            label={businessDetailsCopy.legalName.label}
            placeholder={businessDetailsCopy.legalName.placeholder}
            error={errors.legalName?.message}
            {...register('legalName')}
          />
          <TextField
            label={businessDetailsCopy.cacNumber.label}
            placeholder={businessDetailsCopy.cacNumber.placeholder}
            error={errors.cacNumber?.message}
            {...register('cacNumber')}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label={businessDetailsCopy.businessType.label}
              placeholder={businessDetailsCopy.businessType.placeholder}
              options={businessTypeOptions}
              error={errors.businessType?.message}
              {...register('businessType')}
            />
            <SelectField
              label={businessDetailsCopy.industry.label}
              placeholder={businessDetailsCopy.industry.placeholder}
              options={industryOptions}
              error={errors.industry?.message}
              {...register('industry')}
            />
          </div>
          <SelectField
            label={businessDetailsCopy.state.label}
            placeholder={businessDetailsCopy.state.placeholder}
            options={nigerianStates.map((s) => ({ value: s, label: s }))}
            error={errors.state?.message}
            {...register('state')}
          />
        </div>

        {mutation.isError ? (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            We couldn’t save your details. Check your connection and try again.
          </p>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : businessDetailsCopy.continue}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
