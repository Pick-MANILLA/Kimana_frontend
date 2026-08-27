import type { ApiErrorCode } from '../types/common';
import type { ApiError } from '../types/common';

export function delay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockApiError extends Error implements ApiError {
  readonly code: ApiErrorCode;
  readonly retryable: boolean;

  constructor(code: ApiErrorCode, message: string, retryable: boolean) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.retryable = retryable;
  }
}

export function apiError(code: ApiErrorCode, message: string, retryable = true): ApiError {
  return new MockApiError(code, message, retryable);
}

/**
 * Every mock call routes through this: a realistic latency window, plus an
 * injectable random failure so loading/error UI paths are exercised during
 * development, not just the happy path. `failureRate` defaults to a low
 * background rate so the app "just works" most of the time in dev, the way
 * a real flaky mobile network would.
 */
export async function simulateNetwork(options?: { minMs?: number; maxMs?: number; failureRate?: number }): Promise<void> {
  const { minMs = 300, maxMs = 900, failureRate = 0.04 } = options ?? {};
  await delay(minMs, maxMs);
  if (Math.random() < failureRate) {
    throw apiError('NETWORK', 'The connection dropped before this finished. Check your signal and try again.', true);
  }
}
