'use client';

import { useQuery } from '@tanstack/react-query';
import { api, DEMO_CUSTOMER_ID } from '../../api';

export const onboardingQueryKey = ['onboarding', 'application'];

export function useOnboardingApplication() {
  return useQuery({
    queryKey: onboardingQueryKey,
    queryFn: () => api.onboarding.getApplication(DEMO_CUSTOMER_ID),
  });
}
