/**
 * Mock API for the /exchange page.
 *
 * Three capabilities:
 *   1. Get the customer's settlement balance (USDC account).
 *   2. Request and execute a conversion quote between a local-currency
 *      balance and the settlement balance (in either direction).
 *   3. Initiate an external payout of settlement balance to an external
 *      destination reference.
 *
 * USDC is shown to users by that name on /exchange. "External destination
 * reference" in the UI corresponds to a destination address at the
 * infrastructure layer, but is deliberately kept generic in copy.
 */

import { DEMO_CUSTOMER_ID, store } from './seed';
import { apiError, simulateNetwork } from './simulate';

const QUOTE_TTL_MS = 90_000;

// ---------------------------------------------------------------------------
// Payout state machine
// ---------------------------------------------------------------------------

/**
 * States a settlement payout passes through, in order.
 * These are plain-language operational states — no chain/settlement
 * terminology in the enum values themselves.
 */
export const PAYOUT_STATUSES = [
  'SUBMITTED',
  'PROCESSING',
  'DISPATCHED',
  'COMPLETED',
];

const TERMINAL_PAYOUT_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUsdcRate(sendCurrency, receiveCurrency) {
  const key = `${sendCurrency}/${receiveCurrency}`;
  const entry = store.fxRates.get(key);
  if (!entry) {
    throw apiError('VALIDATION', `No rate available for ${key}.`, false);
  }
  // Light jitter so "indicative" rates visibly move on each poll.
  const jitter = 1 + (Math.random() - 0.5) * 0.002;
  const rate = { ...entry, rate: Math.round(entry.rate * jitter * 1e6) / 1e6, asOf: new Date().toISOString() };
  store.fxRates.set(key, rate);
  return rate;
}

function applyConversion(sendAmountMinor, rate) {
  return Math.round(sendAmountMinor * rate);
}

function nowIso() {
  return new Date().toISOString();
}

function shortId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const settlementApi = {
  /**
   * Returns the customer's settlement balance account.
   * Shape matches the existing AccountBalance type in seed.js.
   */
  async getSettlementBalance() {
    await simulateNetwork({ minMs: 200, maxMs: 600 });
    const balance = store.balances.find((b) => b.currency === 'USDC');
    if (!balance) throw apiError('NOT_FOUND', 'Settlement balance account not found.', false);
    return { ...balance, asOf: nowIso() };
  },

  /**
   * Returns all local-currency balances (non-USDC) available for conversion.
   * Reuses the same AccountBalance shape.
   */
  async getLocalBalances() {
    await simulateNetwork({ minMs: 150, maxMs: 500 });
    return store.balances
      .filter((b) => b.currency !== 'USDC')
      .map((b) => ({ ...b, asOf: nowIso() }));
  },

  /**
   * Returns an indicative rate for a currency pair involving USDC.
   * Fast poll — used to show a "live" rate estimate before requesting
   * a firm quote.
   */
  async getIndicativeRate(sendCurrency, receiveCurrency) {
    await simulateNetwork({ minMs: 150, maxMs: 400, failureRate: 0.02 });
    return getUsdcRate(sendCurrency, receiveCurrency);
  },

  /**
   * Requests a firm conversion quote locked for QUOTE_TTL_MS (90 s).
   *
   * input: {
   *   sendCurrency: string,
   *   receiveCurrency: string,
   *   amountField: 'send' | 'receive',
   *   amount: Money,          // { amountMinor: number, currency: string }
   * }
   *
   * Returns a ConversionQuote:
   * {
   *   id: string,
   *   direction: 'to_settlement' | 'from_settlement',
   *   breakdown: {
   *     rate: number,
   *     fee: Money,
   *     sendAmount: Money,
   *     receiveAmount: Money,
   *   },
   *   issuedAt: string,
   *   expiresAt: string,
   * }
   */
  async requestConversionQuote(input) {
    await simulateNetwork();
    const rateEntry = getUsdcRate(input.sendCurrency, input.receiveCurrency);

    const sendAmount =
      input.amountField === 'send'
        ? input.amount
        : { amountMinor: Math.round(input.amount.amountMinor / rateEntry.rate), currency: input.sendCurrency };

    const receiveAmount =
      input.amountField === 'receive'
        ? input.amount
        : { amountMinor: applyConversion(input.amount.amountMinor, rateEntry.rate), currency: input.receiveCurrency };

    // Validate the customer actually has enough to send.
    const sourceBalance = store.balances.find((b) => b.currency === input.sendCurrency);
    if (sourceBalance && sourceBalance.balance.amountMinor < sendAmount.amountMinor) {
      throw apiError('INSUFFICIENT_FUNDS', 'The requested amount exceeds your available balance.', false);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + QUOTE_TTL_MS);

    const direction = input.receiveCurrency === 'USDC' ? 'to_settlement' : 'from_settlement';

    return {
      id: shortId('cq'),
      direction,
      sendCurrency: input.sendCurrency,
      receiveCurrency: input.receiveCurrency,
      breakdown: {
        rate: rateEntry.rate,
        fee: { amountMinor: 0, currency: input.sendCurrency },
        sendAmount,
        receiveAmount,
      },
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  },

  /**
   * Executes a previously issued conversion quote.
   *
   * input: { quoteId: string, quote: ConversionQuote, idempotencyKey: string }
   *
   * Mutates store.balances in place (debit send, credit receive).
   * Returns a ConversionResult: { id, reference, executedAt, sendAmount, receiveAmount }
   */
  async executeConversion(input) {
    await simulateNetwork({ minMs: 600, maxMs: 1400, failureRate: 0.05 });

    const { quote } = input;

    // Expire check.
    if (new Date(quote.expiresAt) < new Date()) {
      throw apiError('QUOTE_EXPIRED', 'This quote has expired. Request a new one to continue.', false);
    }

    // Debit the source balance.
    const sourceAccount = store.balances.find((b) => b.currency === quote.sendCurrency);
    if (!sourceAccount) throw apiError('NOT_FOUND', 'Source balance account not found.', false);
    if (sourceAccount.balance.amountMinor < quote.breakdown.sendAmount.amountMinor) {
      throw apiError('INSUFFICIENT_FUNDS', 'Insufficient balance to complete this conversion.', false);
    }
    sourceAccount.balance = {
      ...sourceAccount.balance,
      amountMinor: sourceAccount.balance.amountMinor - quote.breakdown.sendAmount.amountMinor,
    };
    sourceAccount.asOf = nowIso();

    // Credit the destination balance.
    const destAccount = store.balances.find((b) => b.currency === quote.receiveCurrency);
    if (!destAccount) throw apiError('NOT_FOUND', 'Destination balance account not found.', false);
    destAccount.balance = {
      ...destAccount.balance,
      amountMinor: destAccount.balance.amountMinor + quote.breakdown.receiveAmount.amountMinor,
    };
    destAccount.asOf = nowIso();

    const result = {
      id: shortId('conv'),
      reference: `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: input.idempotencyKey,
      direction: quote.direction,
      sendAmount: quote.breakdown.sendAmount,
      receiveAmount: quote.breakdown.receiveAmount,
      rate: quote.breakdown.rate,
      executedAt: nowIso(),
    };

    return result;
  },

  /**
   * Requests a firm quote for an external payout of settlement balance.
   *
   * input: {
   *   amount: Money,                    // must be USDC
   *   destinationReference: string,    // opaque external reference — not
   *                                    // labelled "wallet address" anywhere
   * }
   *
   * Returns a PayoutQuote: same shape as ConversionQuote but with
   * direction: 'external_payout'.
   */
  async requestPayoutQuote(input) {
    await simulateNetwork();

    if (!input.destinationReference || input.destinationReference.trim().length < 6) {
      throw apiError('VALIDATION', 'Please enter a valid destination reference.', false);
    }

    const usdcBalance = store.balances.find((b) => b.currency === 'USDC');
    if (usdcBalance && usdcBalance.balance.amountMinor < input.amount.amountMinor) {
      throw apiError('INSUFFICIENT_FUNDS', 'The requested amount exceeds your settlement balance.', false);
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + QUOTE_TTL_MS);

    // Network fee for external dispatch: flat 2 USDC (200 minor units).
    const feeMinor = 200;

    return {
      id: shortId('pq'),
      direction: 'external_payout',
      destinationReference: input.destinationReference,
      breakdown: {
        rate: 1,
        fee: { amountMinor: feeMinor, currency: 'USDC' },
        sendAmount: { amountMinor: input.amount.amountMinor, currency: 'USDC' },
        // Net amount received at destination after fee.
        receiveAmount: { amountMinor: input.amount.amountMinor - feeMinor, currency: 'USDC' },
      },
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  },

  /**
   * Executes an external payout order.
   *
   * Creates a payout record in store.settlementPayouts with status SUBMITTED.
   * The payout then auto-advances through PAYOUT_STATUSES over time via
   * `advancePayoutStatus` (called by the UI polling loop).
   *
   * input: { quote: PayoutQuote, idempotencyKey: string }
   *
   * Returns a SettlementPayout record.
   */
  async executePayout(input) {
    await simulateNetwork({ minMs: 700, maxMs: 1600, failureRate: 0.05 });

    const { quote } = input;

    if (new Date(quote.expiresAt) < new Date()) {
      throw apiError('QUOTE_EXPIRED', 'This quote has expired. Request a new one to continue.', false);
    }

    // Debit settlement balance.
    const usdcAccount = store.balances.find((b) => b.currency === 'USDC');
    if (!usdcAccount) throw apiError('NOT_FOUND', 'Settlement balance not found.', false);
    if (usdcAccount.balance.amountMinor < quote.breakdown.sendAmount.amountMinor) {
      throw apiError('INSUFFICIENT_FUNDS', 'Insufficient settlement balance to complete this payout.', false);
    }
    usdcAccount.balance = {
      ...usdcAccount.balance,
      amountMinor: usdcAccount.balance.amountMinor - quote.breakdown.sendAmount.amountMinor,
    };
    usdcAccount.asOf = nowIso();

    const payout = {
      id: shortId('po'),
      reference: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: input.idempotencyKey,
      destinationReference: quote.destinationReference,
      sendAmount: quote.breakdown.sendAmount,
      receiveAmount: quote.breakdown.receiveAmount,
      fee: quote.breakdown.fee,
      status: 'SUBMITTED',
      history: [{ status: 'SUBMITTED', enteredAt: nowIso() }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    store.settlementPayouts.push(payout);
    return payout;
  },

  /**
   * Fetches the current state of a settlement payout by id.
   * Used by the UI polling loop to display live status updates.
   */
  async getPayoutStatus(id) {
    await simulateNetwork({ minMs: 200, maxMs: 600, failureRate: 0.02 });
    const payout = store.settlementPayouts.find((p) => p.id === id);
    if (!payout) throw apiError('NOT_FOUND', 'Payout not found.', false);
    return { ...payout };
  },

  /**
   * Advances a payout to its next state (called by the UI simulation ticker).
   * Returns the updated payout record.
   * No-op if the payout is already in a terminal state.
   */
  async advancePayoutStatus(id) {
    await simulateNetwork({ minMs: 100, maxMs: 300, failureRate: 0 });
    const payout = store.settlementPayouts.find((p) => p.id === id);
    if (!payout) throw apiError('NOT_FOUND', 'Payout not found.', false);

    if (TERMINAL_PAYOUT_STATUSES.has(payout.status)) return { ...payout };

    const currentIndex = PAYOUT_STATUSES.indexOf(payout.status);
    const nextStatus = PAYOUT_STATUSES[currentIndex + 1] ?? payout.status;

    payout.status = nextStatus;
    payout.history = [...payout.history, { status: nextStatus, enteredAt: nowIso() }];
    payout.updatedAt = nowIso();

    return { ...payout };
  },

  /**
   * Lists all settlement payouts for the demo customer (most recent first).
   */
  async listPayouts() {
    await simulateNetwork({ minMs: 200, maxMs: 600 });
    return [...store.settlementPayouts].reverse();
  },
};
