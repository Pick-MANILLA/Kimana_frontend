'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { api } from '../../api';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { directorsUboCopy } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Enter the director’s full name.'),
  bvn: z.string().trim().regex(/^\d{11}$/, 'Enter an 11-digit BVN.'),
  dateOfBirth: z.string().trim().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Enter the date as DD/MM/YYYY.'),
  nin: z.string().trim().regex(/^\d{11}$/, 'Enter an 11-digit NIN.'),
  uboFullName: z.string().trim().optional(),
  uboOwnership: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (/^\d{1,3}$/.test(v) && Number(v) <= 100), 'Enter a percentage between 1 and 100.'),
});

function toIsoDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

function buildPrincipals(values) {
  const director = {
    id: `principal_${Math.random().toString(36).slice(2, 10)}`,
    fullName: values.fullName,
    role: 'director',
    dateOfBirth: toIsoDate(values.dateOfBirth),
    bvn: values.bvn,
    nin: values.nin,
  };
  if (!values.uboFullName?.trim()) return [director];

  const ubo = {
    id: `principal_${Math.random().toString(36).slice(2, 10)}`,
    fullName: values.uboFullName,
    role: 'beneficial_owner',
    ownershipPercentage: values.uboOwnership ? Number(values.uboOwnership) : undefined,
  };
  return [director, ubo];
}

export function DirectorsUboPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();
  const [addedPrincipals, setAddedPrincipals] = useState(
    () => application?.principals.slice() ?? [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { fullName: '', bvn: '', dateOfBirth: '', nin: '', uboFullName: '', uboOwnership: '' },
  });

  const mutation = useMutation({
    mutationFn: (principals) => {
      if (!application) throw new Error('Application not loaded yet');
      return api.onboarding.savePrincipals(application.id, principals);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(onboardingQueryKey, updated);
      router.push('/onboarding/documents');
    },
  });

  function handleAddAnother(values) {
    setAddedPrincipals((prev) => [...prev, ...buildPrincipals(values)]);
    reset();
  }

  function handleContinue(values) {
    const hasDraftEntry = values.fullName.trim().length > 0;
    const all = hasDraftEntry ? [...addedPrincipals, ...buildPrincipals(values)] : addedPrincipals;
    mutation.mutate(all);
  }

  function removePrincipal(id) {
    setAddedPrincipals((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <OnboardingLayout stepIndex={1} title={directorsUboCopy.title} subtitle={directorsUboCopy.subtitle}>
      {addedPrincipals.length > 0 ? (
        <ul className="mb-5 space-y-2">
          {addedPrincipals.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md px-4 py-2.5 text-sm"
              style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}
            >
              <span>
                {p.fullName} <span style={{ color: 'var(--color-text-secondary)' }}>· {p.role === 'director' ? 'Director' : 'Beneficial owner'}</span>
              </span>
              <button
                type="button"
                onClick={() => removePrincipal(p.id)}
                className="text-xs font-medium"
                style={{ color: 'var(--color-danger)' }}
                aria-label={`Remove ${p.fullName}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit(handleContinue)} noValidate>
        <TextField
          label={directorsUboCopy.fullName.label}
          placeholder={directorsUboCopy.fullName.placeholder}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={directorsUboCopy.bvn.label}
            placeholder={directorsUboCopy.bvn.placeholder}
            inputMode="numeric"
            error={errors.bvn?.message}
            {...register('bvn')}
          />
          <TextField
            label={directorsUboCopy.dateOfBirth.label}
            placeholder={directorsUboCopy.dateOfBirth.placeholder}
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>
        <TextField
          label={directorsUboCopy.nin.label}
          placeholder={directorsUboCopy.nin.placeholder}
          inputMode="numeric"
          error={errors.nin?.message}
          {...register('nin')}
        />

        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {directorsUboCopy.uboSectionTitle}{' '}
            <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>
              {directorsUboCopy.uboSectionHint}
            </span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={directorsUboCopy.uboFullName.label}
            placeholder={directorsUboCopy.uboFullName.placeholder}
            error={errors.uboFullName?.message}
            {...register('uboFullName')}
          />
          <TextField
            label={directorsUboCopy.uboOwnership.label}
            placeholder={directorsUboCopy.uboOwnership.placeholder}
            inputMode="numeric"
            error={errors.uboOwnership?.message}
            {...register('uboOwnership')}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit(handleAddAnother)}
          className="text-sm font-medium"
          style={{ color: 'var(--color-brand-400)' }}
        >
          + {directorsUboCopy.addAnother}
        </button>

        {mutation.isError ? (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            We couldn’t save this. Check your connection and try again.
          </p>
        ) : null}

        <div className="flex justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.push('/onboarding/business-details')}>
            {directorsUboCopy.back}
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || (!isValid && addedPrincipals.length === 0)}
          >
            {mutation.isPending ? 'Saving…' : directorsUboCopy.continue}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
}
