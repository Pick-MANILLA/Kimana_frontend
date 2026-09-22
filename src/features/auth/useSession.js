'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../../api';

export const sessionQueryKey = ['auth', 'session'];

/** 401 (no session) is an expected, common state here — never retried as if it were a network blip. */
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => api.auth.getSession(),
    retry: false,
  });
}
