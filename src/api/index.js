import { mockApiClient } from './mock';

/**
 * The single point where mock and live implementations swap. Every
 * consumer imports `api` from here, never from `./mock` or a future
 * `./live` directly — so going live is a one-line change to this file.
 */
export const api = mockApiClient;

export { DEMO_CUSTOMER_ID } from './mock/seed';
