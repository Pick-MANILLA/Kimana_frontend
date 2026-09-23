'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api, DEMO_CUSTOMER_ID } from '../../api';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { businessDetailsCopy, businessTypeOptions, industryOptions, nigerianStates } from '../../copy';
import { sessionQueryKey } from '../auth/useSession';
import { OnboardingLayout } from './OnboardingLayout';
import { SaveErrorBanner } from './SaveErrorBanner';
import { applyFieldErrors } from './saveErrors';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const businessTypeValues = businessTypeOptions.map((o) => o.value);
const industryValues = industryOptions.map((o) => o.value);

// Backend field keys are snake_case; only fields rendered on this form are mapped.
const SERVER_FIELD_MAP = {
  email: 'email',
  password: 'password',
  legal_name: 'legalName',
  legalName: 'legalName',
  cac_number: 'cacNumber',
  cacNumber: 'cacNumber',
  business_type: 'businessType',
  businessType: 'businessType',
  industry: 'industry',
  state: 'state',
  'trading_address.state': 'state',
};

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
    setError,
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

  const [errorShownOnFields, setErrorShownOnFields] = useState(false);

  const mutation = useMutation({
    mutationFn: async (values) => {
      // A fresh visitor has no session yet — register() creates the account
      // (and, on the live backend, a blank draft application alongside it)
      // before we can save anything onto it. A visitor returning to an
      // already-registered draft just saves directly.
      let app = application;
      if (!app) {
        const session = await api.auth.register({
          email: values.email,
          password: values.password,
          displayName: values.legalName,
          legalName: values.legalName,
        });
        queryClient.setQueryData(sessionQueryKey, session);
        app = await api.onboarding.getApplication(DEMO_CUSTOMER_ID);
      }

      return api.onboarding.saveBusinessDetails(app.id, {
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
    onMutate: () => setErrorShownOnFields(false),
    onSuccess: (updated) => {
      queryClient.setQueryData(onboardingQueryKey, updated);
      router.push('/onboarding/directors-ubo');
    },
    onError: (error) => {
      let applied = applyFieldErrors(error, setError, SERVER_FIELD_MAP);
      // Only /register can conflict in this flow, and its only conflict is a taken email.
      if (!applied && error?.code === 'CONFLICT') {
        setError('email', { type: 'server', message: error.message }, { shouldFocus: true });
        applied = true;
      }
      setErrorShownOnFields(applied);
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

        {mutation.isError && !errorShownOnFields ? <SaveErrorBanner error={mutation.error} /> : null}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : businessDetailsCopy.continue}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
