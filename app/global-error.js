'use client';

import './globals.css';
import { useEffect } from 'react';

export default function GlobalError({ error, retry }) {
  useEffect(() => {
    // Never log the raw error/stack in production (CWE-209) — this is where
    // a telemetry call (Sentry/Datadog) would report `error.digest` instead.
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    // global-error replaces the root layout, so it defines its own html/body
    // and can't rely on the theme-init script or Providers from layout.js —
    // globals.css's bare :root already matches the dark theme, so no
    // data-theme attribute is needed here.
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100svh', background: 'var(--color-canvas)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'color-mix(in srgb, var(--color-danger) 15%, transparent)', color: 'var(--color-danger)' }}
          >
            !
          </div>
          <div>
            <h1 className="font-bold text-lg">Kimana hit an unexpected error</h1>
            <p className="mt-1 text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Something went wrong loading the application. No transactions were executed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold border"
              style={{ color: 'var(--color-brand-600)', borderColor: 'var(--color-brand-600)' }}
            >
              Back to Dashboard
            </a>
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold"
              style={{ background: 'var(--color-brand-600)', color: 'var(--color-text-on-brand)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
