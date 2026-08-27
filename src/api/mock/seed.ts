import type { Session } from '../types/auth';
import type { CurrencyCode } from '../types/common';
import type { AccountBalance } from '../types/ledger';
import type { OnboardingApplication } from '../types/onboarding';
import type { IndicativeRate } from '../types/quote';
import type { Recipient, Transfer } from '../types/transfer';
import type { PendingAction, WorkingCapitalOffer } from '../types/dashboard';

export const DEMO_CUSTOMER_ID = 'cust_demo_01';

/**
 * Single mutable in-memory store standing in for a backend during
 * development. Every mock*Api module reads/writes through this so state
 * (e.g. an onboarding application moving through statuses, a document
 * upload's progress) is consistent across calls within a session.
 */
export interface MockStore {
  session: Session;
  onboarding: OnboardingApplication;
  recipients: Recipient[];
  transfers: Transfer[];
  balances: AccountBalance[];
  fxRates: Map<string, IndicativeRate>;
  pendingActions: PendingAction[];
  workingCapitalOffer: WorkingCapitalOffer;
}

function nowIso(daysAgo = 0, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function seedTransfers(): Transfer[] {
  const baseQuote = (rate: number, sendMinor: number, sendCcy: 'USD' | 'EUR', receiveMinor: number) => ({
    id: `quote_${Math.random().toString(36).slice(2, 8)}`,
    sendCurrency: sendCcy,
    receiveCurrency: 'NGN' as const,
    breakdown: {
      rate,
      fee: { amountMinor: 0, currency: sendCcy },
      sendAmount: { amountMinor: sendMinor, currency: sendCcy },
      receiveAmount: { amountMinor: receiveMinor, currency: 'NGN' as const },
    },
    issuedAt: nowIso(1),
    expiresAt: nowIso(1),
  });

  return [
    {
      id: 'txn_8844',
      reference: 'TXN-8844',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8844',
      recipientId: 'rcpt_amsterdam_commodities',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 4_500_000, currency: 'USD' },
      receiveAmount: { amountMinor: 7_402_500_00, currency: 'NGN' },
      tradeDescription: 'Cashew export',
      quote: baseQuote(1645.0, 4_500_000, 'USD', 7_402_500_00),
      state: { status: 'COMPLETED', enteredAt: nowIso(4), payoutReference: 'PO-8844' },
      createdAt: nowIso(4, 3),
      updatedAt: nowIso(4),
    },
    {
      id: 'txn_8843',
      reference: 'TXN-8843',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8843',
      recipientId: 'rcpt_kerala_spices',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 1_850_000, currency: 'USD' },
      receiveAmount: { amountMinor: 3_043_250_00, currency: 'NGN' },
      tradeDescription: 'Sesame export',
      quote: baseQuote(1645.0, 1_850_000, 'USD', 3_043_250_00),
      state: { status: 'PAYING_OUT', enteredAt: nowIso(5) },
      createdAt: nowIso(5, 2),
      updatedAt: nowIso(5),
    },
    {
      id: 'txn_8842',
      reference: 'TXN-8842',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8842',
      recipientId: 'rcpt_naturalia_foods',
      sendCurrency: 'EUR',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 2_200_000, currency: 'EUR' },
      receiveAmount: { amountMinor: 3_965_500_00, currency: 'NGN' },
      tradeDescription: 'Hibiscus export',
      quote: baseQuote(1802.5, 2_200_000, 'EUR', 3_965_500_00),
      state: { status: 'SCREENED', enteredAt: nowIso(6), hold: false },
      createdAt: nowIso(6, 1),
      updatedAt: nowIso(6),
    },
    {
      id: 'txn_8841',
      reference: 'TXN-8841',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8841',
      recipientId: 'rcpt_rotterdam_grain',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 7_800_000, currency: 'USD' },
      receiveAmount: { amountMinor: 12_831_000_00, currency: 'NGN' },
      tradeDescription: 'Cocoa export',
      quote: baseQuote(1645.0, 7_800_000, 'USD', 12_831_000_00),
      state: { status: 'COMPLETED', enteredAt: nowIso(9), payoutReference: 'PO-8841' },
      createdAt: nowIso(9, 3),
      updatedAt: nowIso(9),
    },
    {
      id: 'txn_8840',
      reference: 'TXN-8840',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8840',
      recipientId: 'rcpt_gupta_trading',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 1_200_000, currency: 'USD' },
      receiveAmount: { amountMinor: 1_974_000_00, currency: 'NGN' },
      tradeDescription: 'Sesame export',
      quote: baseQuote(1645.0, 1_200_000, 'USD', 1_974_000_00),
      state: {
        status: 'REVERSED',
        enteredAt: nowIso(12),
        reason: 'Partner returned funds — beneficiary account closed.',
        reversalLedgerEntryId: 'ledger_rev_8840',
      },
      createdAt: nowIso(12, 3),
      updatedAt: nowIso(12),
    },
  ];
}

function seedRecipients(): Recipient[] {
  const now = nowIso();
  const entries: [string, string, string, CurrencyCode][] = [
    ['rcpt_amsterdam_commodities', 'Amsterdam Commodities BV', 'NL', 'USD'],
    ['rcpt_kerala_spices', 'Kerala Spices Corp', 'IN', 'USD'],
    ['rcpt_naturalia_foods', 'Naturalia Foods GmbH', 'DE', 'EUR'],
    ['rcpt_rotterdam_grain', 'Rotterdam Grain Exchange', 'NL', 'USD'],
    ['rcpt_gupta_trading', 'Gupta Trading India Pvt Ltd', 'IN', 'USD'],
  ];
  return entries.map(([id, accountName, country, currency]) => ({
    id,
    customerId: DEMO_CUSTOMER_ID,
    accountName,
    accountNumber: '0000000000',
    bankCode: '000',
    bankName: 'Partner Bank',
    currency,
    country,
    validationStatus: 'valid',
    savedAt: now,
  }));
}

function seedFxRates(): Map<string, IndicativeRate> {
  const now = nowIso();
  const entries: [string, number, number][] = [
    ['USD/NGN', 1645.2, 0.32],
    ['EUR/NGN', 1802.5, -0.11],
    ['GBP/NGN', 2088.4, 0.18],
    ['GHS/NGN', 110.25, -0.44],
  ];
  return new Map(
    entries.map(([pair, rate, changePercent24h]) => {
      const [sendCurrency, receiveCurrency] = pair.split('/') as [
        IndicativeRate['sendCurrency'],
        IndicativeRate['receiveCurrency'],
      ];
      return [pair, { sendCurrency, receiveCurrency, rate, changePercent24h, asOf: now }];
    }),
  );
}

export function createMockStore(): MockStore {
  return {
    session: {
      userId: 'user_chinonso',
      role: 'customer',
      displayName: 'Chinonso',
    },
    onboarding: {
      id: 'app_demo_01',
      customerId: DEMO_CUSTOMER_ID,
      status: 'draft',
      business: null,
      principals: [],
      documents: [],
    },
    recipients: seedRecipients(),
    transfers: seedTransfers(),
    balances: [
      {
        accountId: 'acct_ngn',
        currency: 'NGN',
        balance: { amountMinor: 4_825_000_000, currency: 'NGN' },
        asOf: nowIso(),
      },
      {
        accountId: 'acct_usd',
        currency: 'USD',
        balance: { amountMinor: 12_450_000, currency: 'USD' },
        pending: { amountMinor: 1_850_000, currency: 'USD' },
        asOf: nowIso(),
      },
      {
        accountId: 'acct_eur',
        currency: 'EUR',
        balance: { amountMinor: 1_820_000, currency: 'EUR' },
        asOf: nowIso(),
      },
    ],
    fxRates: seedFxRates(),
    pendingActions: [
      {
        id: 'pact_paar_8842',
        title: 'PAAR — TXN-8842',
        subtitle: 'Upload required',
        kind: 'action_required',
        transferId: 'txn_8842',
      },
      {
        id: 'pact_formq_8843',
        title: 'Form Q — Sesame export',
        subtitle: 'Pending review',
        kind: 'in_review',
        transferId: 'txn_8843',
      },
      {
        id: 'pact_bol_8843',
        title: 'BoL — TXN-8843',
        subtitle: 'Submitted for verification',
        kind: 'submitted',
        transferId: 'txn_8843',
      },
    ],
    workingCapitalOffer: {
      maxAdvance: { amountMinor: 3_825_000, currency: 'USD' },
      basisDescription: 'Against Amsterdam Commodities receivable',
      monthlyRatePercent: 2.5,
    },
  };
}

export const store = createMockStore();
