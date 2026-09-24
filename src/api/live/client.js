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
    this.fieldErrors = body.field_errors ?? body.fieldErrors ?? {};
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

    // Real: balance, buy (local -> USDC), convert (USDC -> local), and trade
    // history. NOT real: external payout of USDC to an outside destination —
    // the deployed vault contract has no per-customer send function (only
    // pooled fund/settle between the operator and registered on/off-ramp
    // partners), so requestPayoutQuote/executePayout/getPayoutStatus/
    // advancePayoutStatus/listPayouts stay on the mock via the spread below.
    // See Kimana_backend#77 for the full writeup of what the contract can
    // and can't do.
    settlement: {
      ...mockApiClient.settlement,

      getSettlementBalance: async () => {
        const res = await http('GET', '/settlement/balance');
        return {
          accountId: 'settlement',
          currency: res.asset,
          balance: { amountMinor: res.amountMinor, currency: res.asset },
          asOf: res.asOf,
        };
      },

      getLocalBalances: async () => {
        const overview = await http('GET', '/dashboard/overview');
        return overview.balances ?? [];
      },

      // No server-side rate lock exists for this feature (unlike the main
      // transfer flow's /quotes) — compose a short-lived client-side preview
      // from the real indicative rate, matching the mock's ConversionQuote
      // shape so ExchangePage doesn't need to branch on live vs mock.
      requestConversionQuote: async (input) => {
        const toUsdc = input.receiveCurrency === 'USDC';
        const localCurrency = toUsdc ? input.sendCurrency : input.receiveCurrency;
        // USDC is USD 1:1 (Kimana_backend#77) — USD itself needs no rate lookup,
        // and the backend rejects an identical send/receive pair anyway.
        const rate = localCurrency === 'USD' ? 1 : (await http('GET', `/rates/indicative?send=USD&receive=${localCurrency}`)).rate;

        // rate = local-currency units per 1 USD (USDC treated as USD 1:1).
        const sendAmount =
          input.amountField === 'send'
            ? input.amount
            : {
                amountMinor: Math.round(toUsdc ? input.amount.amountMinor * rate : input.amount.amountMinor / rate),
                currency: input.sendCurrency,
              };
        const receiveAmount =
          input.amountField === 'receive'
            ? input.amount
            : {
                amountMinor: Math.round(toUsdc ? input.amount.amountMinor / rate : input.amount.amountMinor * rate),
                currency: input.receiveCurrency,
              };

        const issuedAt = new Date();
        return {
          id: `cq_${Math.random().toString(36).slice(2, 10)}`,
          direction: toUsdc ? 'to_settlement' : 'from_settlement',
          sendCurrency: input.sendCurrency,
          receiveCurrency: input.receiveCurrency,
          breakdown: { rate, fee: { amountMinor: 0, currency: input.sendCurrency }, sendAmount, receiveAmount },
          issuedAt: issuedAt.toISOString(),
          // No server-enforced expiry for this preview — 90s client-side
          // freshness window so the UI's existing "quote expired" flow works.
          expiresAt: new Date(issuedAt.getTime() + 90_000).toISOString(),
        };
      },

      executeConversion: async (input) => {
        const { quote, idempotencyKey } = input;
        if (new Date(quote.expiresAt) < new Date()) {
          throw new HttpApiError({
            code: 'RATE_EXPIRED',
            message: 'This rate preview has gone stale. Request a new one to continue.',
            retryable: true,
          });
        }

        const headers = { 'idempotency-key': idempotencyKey };
        if (quote.direction === 'to_settlement') {
          await http('POST', '/settlement/buy', { amount: quote.breakdown.sendAmount }, headers);
        } else {
          await http(
            'POST',
            '/settlement/convert',
            { usdcAmountMinor: quote.breakdown.sendAmount.amountMinor, currency: quote.receiveCurrency },
            headers,
          );
        }

        return {
          id: `conv_${Math.random().toString(36).slice(2, 10)}`,
          reference: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
          idempotencyKey,
          direction: quote.direction,
          sendAmount: quote.breakdown.sendAmount,
          receiveAmount: quote.breakdown.receiveAmount,
          rate: quote.breakdown.rate,
          executedAt: new Date().toISOString(),
        };
      },

      getTransactions: () => http('GET', '/settlement/transactions'),
    },
  };
}
