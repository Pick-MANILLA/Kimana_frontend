// ============================================================================
//  Live API client — talks to the real Kimana_backend (Rust/axum) over
//  HTTP/JSON instead of the in-memory mock. Sourced from
//  Pick-MANILLA/Kimana_backend's integration/live-api-client.ts and adapted
//  from TypeScript to plain JS (this frontend has no TypeScript — see
//  api/mock for the same pattern: no interfaces, no annotations, just the
//  runtime shape).
//
//  Implements the P1 + P2 endpoints (auth, onboarding, dashboard, quote,
//  recipients, transfers) against the real backend, and delegates every
//  not-yet-built method (trade documents, screening, delays, reconciliation,
//  partners, audit, all ops, settlement) to the existing mock via
//  `...mockApiClient`. As each later phase ships on the backend, move that
//  domain's methods off `mockApiClient` and onto `http` here.
// ============================================================================

import { mockApiClient } from '../mock';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

class HttpApiError extends Error {
  constructor(body) {
    super(body.message);
    this.name = 'ApiError';
    this.code = body.code;
    this.retryable = body.retryable;
  }
}

// Rejections raised by axum's own layers (e.g. DefaultBodyLimit) arrive as
// plain text, not the `{ code, message, retryable }` JSON the handlers send.
const PLAIN_STATUS_ERRORS = {
  413: { code: 'VALIDATION', message: 'File exceeds maximum allowed size of 10 MB.', retryable: false },
  415: { code: 'VALIDATION', message: 'Unsupported file type. Upload a PDF, JPG, or PNG.', retryable: false },
};

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function parseOrThrow(res) {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!res.ok) {
    const json = text ? tryParseJson(text) : undefined;
    if (json && typeof json === 'object' && 'code' in json) {
      throw new HttpApiError(json);
    }
    if (PLAIN_STATUS_ERRORS[res.status]) {
      throw new HttpApiError(PLAIN_STATUS_ERRORS[res.status]);
    }
    throw new HttpApiError({
      code: 'SERVER_ERROR',
      message: `Request failed (${res.status}).`,
      retryable: res.status >= 500,
    });
  }
  return text ? JSON.parse(text) : undefined;
}

async function http(method, path, body, extraHeaders) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...extraHeaders,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new HttpApiError({
      code: 'NETWORK',
      message: 'The connection dropped before this finished. Check your signal and try again.',
      retryable: true,
    });
  }
  return parseOrThrow(res);
}

async function upload(path, fields, file) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  form.append('file', file.data, file.fileName);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method: 'POST', credentials: 'include', body: form });
  } catch {
    throw new HttpApiError({
      code: 'NETWORK',
      message: 'The upload was interrupted. Try again.',
      retryable: true,
    });
  }
  return parseOrThrow(res);
}

export function createLiveApiClient() {
  return {
    ...mockApiClient,

    auth: {
      getSession: () => http('GET', '/session'),
      /** input: { email, password, displayName, legalName } */
      register: (input) => http('POST', '/register', input),
      /** input: { email, password } */
      login: (input) => http('POST', '/login', input),
      logout: () => http('POST', '/logout'),
    },

    onboarding: {
      getApplication: (_customerId) => http('GET', '/onboarding/application'),

      saveBusinessDetails: (applicationId, business) =>
        http('PUT', '/onboarding/application/business', { applicationId, business }),

      savePrincipals: (applicationId, principals) =>
        http('PUT', '/onboarding/application/principals', { applicationId, principals }),

      uploadDocument: async (applicationId, file, onProgress) => {
        const doc = await upload(
          '/onboarding/application/documents',
          { applicationId, type: file.type },
          file,
        );
        onProgress?.(100);
        return doc;
      },

      retryDocumentUpload: (_applicationId, documentId) =>
        http('POST', `/onboarding/application/documents/${encodeURIComponent(documentId)}/retry`),

      removeDocument: (_applicationId, documentId) =>
        http('DELETE', `/onboarding/application/documents/${encodeURIComponent(documentId)}`),

      submit: (applicationId) =>
        http('POST', '/onboarding/application/submit', { applicationId }),
    },

    dashboard: {
      getOverview: (_customerId) => http('GET', '/dashboard/overview'),
    },

    quote: {
      getIndicativeRate: (sendCurrency, receiveCurrency) =>
        http('GET', `/rates/indicative?send=${sendCurrency}&receive=${receiveCurrency}`),
      requestFirmQuote: (input) => http('POST', '/quotes', input),
    },

    recipients: {
      listRecipients: (_customerId) => http('GET', '/recipients'),
      validateBankAccount: (input) => http('POST', '/recipients/validate', input),
      saveRecipient: (input) => http('POST', '/recipients', input),
    },

    transfers: {
      createTransfer: (input) =>
        http('POST', '/transfers', input, { 'idempotency-key': input.idempotencyKey }),
      getTransfer: (id) => http('GET', `/transfers/${encodeURIComponent(id)}`),
      getTimeline: (id) => http('GET', `/transfers/${encodeURIComponent(id)}/timeline`),
      listTransfers: (_customerId, filter) =>
        http('GET', `/transfers${filter?.status ? `?status=${filter.status}` : ''}`),
    },
  };
}
