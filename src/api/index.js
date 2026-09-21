import { mockApiClient } from './mock';
import { createLiveApiClient } from './live/client';

/**
 * The single point where mock and live implementations swap. Every
 * consumer imports `api` from here, never from `./mock` or `./live` directly.
 *
 * Live mode turns on when NEXT_PUBLIC_API_URL is set, or unconditionally in
 * production — a production deploy without that env var is a misconfiguration
 * that should surface loudly (a broken live client) rather than silently
 * serve demo data.
 */
export const api =
  process.env.NEXT_PUBLIC_API_URL || process.env.NODE_ENV === 'production'
    ? createLiveApiClient()
    : mockApiClient;

export { DEMO_CUSTOMER_ID } from './mock/seed';
