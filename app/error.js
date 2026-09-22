'use client';

import { useEffect } from 'react';
import { Button } from '../src/components/ui/Button';
import { ExclamationTriangleIcon } from '../src/components/ui/icons';

export default function RouteError({ error, retry }) {
  useEffect(() => {
    // Never log the raw error/stack in production (CWE-209) — this is where
    // a telemetry call (Sentry/Datadog) would report `error.digest` instead.
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <ExclamationTriangleIcon size={40} color="var(--color-warning)" />
      <div>
        <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          Something interrupted this view
        </h2>
        <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
          An unexpected error occurred while loading this section. No transactions were executed.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => window.location.assign('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button type="button" onClick={() => retry()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
