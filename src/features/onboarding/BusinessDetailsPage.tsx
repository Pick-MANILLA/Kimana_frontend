import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../../api';
import type { BusinessType, IndustrySector } from '../../api/types/onboarding';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { businessDetailsCopy, businessTypeOptions, industryOptions, nigerianStates } from '../../copy';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingQueryKey, useOnboardingApplication } from './useOnboardingApplication';

const businessTypeValues = businessTypeOptions.map((o) => o.value) as [BusinessType, ...BusinessType[]];
const industryValues = industryOptions.map((o) => o.value) as [IndustrySector, ...IndustrySector[]];

const schema = z.object({
  legalName: z.string().trim().min(2, 'Enter your registered business name.'),
  cacNumber: z
    .string()
    .trim()
    .regex(/^RC-?\d{4,8}$/i, 'Enter a valid RC number, e.g. RC-1234567.'),
  businessType: z.enum(businessTypeValues, { message: 'Select your business type.' }),
  industry: z.enum(industryValues, { message: 'Select your industry.' }),
  state: z.string().min(1, 'Select your primary state of operation.'),
});

type FormValues = z.infer<typeof schema>;

export function BusinessDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: application } = useOnboardingApplication();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      legalName: application?.business?.legalName ?? '',
      cacNumber: application?.business?.cacNumber ?? '',
      businessType: application?.business?.businessType,
      industry: application?.business?.industry,
      state: application?.business?.tradingAddress.state ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!application) throw new Error('Application not loaded yet');
      return api.onboarding.saveBusinessDetails(application.id, {
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
      navigate('/onboarding/directors-ubo');
    },
  });

  return (
    <OnboardingLayout stepIndex={0} title={businessDetailsCopy.title} subtitle={businessDetailsCopy.subtitle}>
      <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
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
