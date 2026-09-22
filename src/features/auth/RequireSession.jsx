'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './useSession';

/**
 * Gates a page behind a real session. Renders nothing (not the protected
 * content, not an error) while redirecting — the destination page owns its
 * own loading UI once a session is confirmed.
 */
export function RequireSession({ children }) {
  const router = useRouter();
  const { isLoading, isError } = useSession();

  useEffect(() => {
    if (!isLoading && isError) router.replace('/login');
  }, [isLoading, isError, router]);

  if (isLoading) {
    return <div className="min-h-screen" style={{ background: 'var(--color-canvas)' }} aria-hidden="true" />;
  }

  if (isError) return null;

  return children;
}
