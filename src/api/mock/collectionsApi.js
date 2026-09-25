/**
 * Mock API for collections — payment requests the customer raises to be
 * paid (issue #79). Mirrors the real backend's shape (PR
 * Pick-MANILLA/Kimana_backend#80): a currency picks the pay-in partner —
 * NGN opens a one-off bank-transfer receive per request; USD pays into the
 * customer's standing virtual account. Nothing here mentions the partner
 * names or settlement rails to the user — just bank transfer instructions.
 */

import { DEMO_CUSTOMER_ID, store } from './seed';
import { apiError, simulateNetwork } from './simulate';

const DEFAULT_TTL_DAYS = 7;
const MAX_TTL_DAYS = 90;
const MAX_PAYER_NAME_CHARS = 140;
const MAX_NOTE_CHARS = 280;
const SUPPORTED_CURRENCIES = new Set(['NGN', 'USD']);

function nowIso() {
  return new Date().toISOString();
}

function randomDigits(count) {
  let out = '';
  for (let i = 0; i < count; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function shortId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `CL-${code}`;
}

function accountName() {
  return store.onboarding.business?.legalName ?? 'Kimana Customer';
}

function ngnPayIn(reference) {
  return {
    method: 'NG_BANK_TRANSFER',
    bankName: 'Providus Bank',
    accountName: accountName(),
    accountNumber: randomDigits(10),
    memo: reference,
  };
}

function usdPayIn(reference) {
  return {
    method: 'US_BANK_TRANSFER',
    bankName: 'Column N.A.',
    bankAddress: '1 Letterman Drive, San Francisco, CA 94129',
    accountName: accountName(),
    accountNumber: randomDigits(10),
    routingNumber: '084106768',
    paymentRails: ['ach_push', 'wire'],
    memo: reference,
  };
}

function deriveStatus(collection) {
  if (collection.status === 'PENDING' && new Date(collection.expiresAt) <= new Date()) {
    return 'EXPIRED';
  }
  return collection.status;
}

function toPublic(collection) {
  return { ...collection, status: deriveStatus(collection) };
}

export const collectionsApi = {
  /**
   * Creates a payment request with pay-in instructions.
   * input: { amount: Money, payerName?, note?, expiresAt?, idempotencyKey? }
   */
  async create(input) {
    await simulateNetwork({ minMs: 300, maxMs: 800 });

    if (input.idempotencyKey) {
      const existing = store.collections.find((c) => c.customerId === DEMO_CUSTOMER_ID && c.idempotencyKey === input.idempotencyKey);
      if (existing) return toPublic(existing);
    }

    const { amount } = input;
    if (!SUPPORTED_CURRENCIES.has(amount?.currency)) {
      throw apiError('VALIDATION', 'Only NGN and USD payment requests are supported right now.', false);
    }
    if (!amount.amountMinor || amount.amountMinor <= 0) {
      throw apiError('VALIDATION', 'Enter an amount greater than zero.', false);
    }
    if (input.payerName && input.payerName.length > MAX_PAYER_NAME_CHARS) {
      throw apiError('VALIDATION', `Payer name must be at most ${MAX_PAYER_NAME_CHARS} characters.`, false);
    }
    if (input.note && input.note.length > MAX_NOTE_CHARS) {
      throw apiError('VALIDATION', `Note must be at most ${MAX_NOTE_CHARS} characters.`, false);
    }

    const now = new Date();
    let expiresAt = input.expiresAt ? new Date(input.expiresAt) : new Date(now.getTime() + DEFAULT_TTL_DAYS * 86_400_000);
    const maxExpiry = new Date(now.getTime() + MAX_TTL_DAYS * 86_400_000);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) {
      throw apiError('VALIDATION', 'Enter a valid future expiry date.', false);
    }
    if (expiresAt > maxExpiry) expiresAt = maxExpiry;

    const id = shortId('coll');
    const reference = generateReference();
    const payIn = amount.currency === 'NGN' ? ngnPayIn(reference) : usdPayIn(reference);

    const collection = {
      id,
      reference,
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: input.idempotencyKey ?? null,
      amount,
      payerName: input.payerName || undefined,
      note: input.note || undefined,
      status: 'PENDING',
      payIn,
      expiresAt: expiresAt.toISOString(),
      paidAt: undefined,
      cancelledAt: undefined,
      payment: undefined,
      createdAt: nowIso(),
    };

    store.collections.push(collection);
    return toPublic(collection);
  },

  /** Lists payment requests, newest first. */
  async list() {
    await simulateNetwork({ minMs: 200, maxMs: 600 });
    return [...store.collections].reverse().map(toPublic);
  },

  /** Fetches a single payment request. */
  async get(id) {
    await simulateNetwork({ minMs: 150, maxMs: 500 });
    const collection = store.collections.find((c) => c.id === id);
    if (!collection) throw apiError('NOT_FOUND', 'Payment request not found.', false);
    return toPublic(collection);
  },

  /** Cancels a still-pending payment request. */
  async cancel(id) {
    await simulateNetwork({ minMs: 300, maxMs: 700 });
    const collection = store.collections.find((c) => c.id === id);
    if (!collection) throw apiError('NOT_FOUND', 'Payment request not found.', false);
    const status = deriveStatus(collection);
    if (status !== 'PENDING') {
      throw apiError('CONFLICT', 'This payment request has already been paid or has expired.', false);
    }
    collection.status = 'CANCELLED';
    collection.cancelledAt = nowIso();
    return toPublic(collection);
  },

  /** Standing accounts the customer can be paid into at any time. */
  async getReceivingAccounts() {
    await simulateNetwork({ minMs: 200, maxMs: 500 });
    return [
      {
        currency: 'USD',
        payIn: {
          method: 'US_BANK_TRANSFER',
          bankName: 'Column N.A.',
          bankAddress: '1 Letterman Drive, San Francisco, CA 94129',
          accountName: accountName(),
          accountNumber: randomDigits(10),
          routingNumber: '084106768',
          paymentRails: ['ach_push', 'wire'],
        },
      },
    ];
  },
};
