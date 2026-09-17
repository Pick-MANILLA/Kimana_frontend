export const DEMO_CUSTOMER_ID = 'cust_demo_01';

/**
 * Single mutable in-memory store standing in for a backend during
 * development. Every mock*Api module reads/writes through this so state
 * (e.g. an onboarding application moving through statuses, a document
 * upload's progress) is consistent across calls within a session.
 */

function nowIso(daysAgo = 0, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function seedTransfers() {
  const baseQuote = (rate, sendMinor, sendCcy, receiveMinor) => ({
    id: `quote_${Math.random().toString(36).slice(2, 8)}`,
    sendCurrency: sendCcy,
    receiveCurrency: 'NGN',
    breakdown: {
      rate,
      fee: { amountMinor: 0, currency: sendCcy },
      sendAmount: { amountMinor: sendMinor, currency: sendCcy },
      receiveAmount: { amountMinor: receiveMinor, currency: 'NGN' },
    },
    issuedAt: nowIso(1),
    expiresAt: nowIso(1),
  });

  // Full status history per transfer — each entry is { status, enteredAt }.
  // Completed transfers carry every step; in-progress ones stop at current state.
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
      receiveAmount: { amountMinor: 740_250_000, currency: 'NGN' },
      tradeDescription: 'Cashew export',
      quote: baseQuote(1645.0, 4_500_000, 'USD', 740_250_000),
      state: { status: 'COMPLETED', enteredAt: nowIso(4), payoutReference: 'PO-8844' },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(4, 7) },
        { status: 'QUOTED',       enteredAt: nowIso(4, 6) },
        { status: 'SCREENED',     enteredAt: nowIso(4, 5) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(4, 4) },
        { status: 'FUNDED',       enteredAt: nowIso(4, 3) },
        { status: 'SETTLING',     enteredAt: nowIso(4, 2) },
        { status: 'SETTLED',      enteredAt: nowIso(4, 1) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(4, 0) },
        { status: 'COMPLETED',    enteredAt: nowIso(4) },
      ],
      createdAt: nowIso(4, 7),
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
      receiveAmount: { amountMinor: 304_325_000, currency: 'NGN' },
      tradeDescription: 'Sesame export',
      quote: baseQuote(1645.0, 1_850_000, 'USD', 304_325_000),
      state: { status: 'PAYING_OUT', enteredAt: nowIso(5) },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(5, 6) },
        { status: 'QUOTED',       enteredAt: nowIso(5, 5) },
        { status: 'SCREENED',     enteredAt: nowIso(5, 4) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(5, 3) },
        { status: 'FUNDED',       enteredAt: nowIso(5, 2) },
        { status: 'SETTLING',     enteredAt: nowIso(5, 1) },
        { status: 'SETTLED',      enteredAt: nowIso(5, 0) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(5) },
      ],
      createdAt: nowIso(5, 6),
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
      receiveAmount: { amountMinor: 396_550_000, currency: 'NGN' },
      tradeDescription: 'Hibiscus export',
      quote: baseQuote(1802.5, 2_200_000, 'EUR', 396_550_000),
      state: { status: 'SCREENED', enteredAt: nowIso(6), hold: false },
      history: [
        { status: 'CREATED',  enteredAt: nowIso(6, 5) },
        { status: 'QUOTED',   enteredAt: nowIso(6, 4) },
        { status: 'SCREENED', enteredAt: nowIso(6) },
      ],
      createdAt: nowIso(6, 5),
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
      receiveAmount: { amountMinor: 1_283_100_000, currency: 'NGN' },
      tradeDescription: 'Cocoa export',
      quote: baseQuote(1645.0, 7_800_000, 'USD', 1_283_100_000),
      state: { status: 'COMPLETED', enteredAt: nowIso(9), payoutReference: 'PO-8841' },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(9, 8) },
        { status: 'QUOTED',       enteredAt: nowIso(9, 7) },
        { status: 'SCREENED',     enteredAt: nowIso(9, 6) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(9, 5) },
        { status: 'FUNDED',       enteredAt: nowIso(9, 4) },
        { status: 'SETTLING',     enteredAt: nowIso(9, 3) },
        { status: 'SETTLED',      enteredAt: nowIso(9, 2) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(9, 1) },
        { status: 'COMPLETED',    enteredAt: nowIso(9) },
      ],
      createdAt: nowIso(9, 8),
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
      receiveAmount: { amountMinor: 197_400_000, currency: 'NGN' },
      tradeDescription: 'Sesame export',
      quote: baseQuote(1645.0, 1_200_000, 'USD', 197_400_000),
      state: {
        status: 'REVERSED',
        enteredAt: nowIso(12),
        reason: 'Partner returned funds — beneficiary account closed.',
        reversalLedgerEntryId: 'ledger_rev_8840',
      },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(12, 6) },
        { status: 'QUOTED',       enteredAt: nowIso(12, 5) },
        { status: 'SCREENED',     enteredAt: nowIso(12, 4) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(12, 3) },
        { status: 'FUNDED',       enteredAt: nowIso(12, 2) },
        { status: 'REVERSING',    enteredAt: nowIso(12, 1) },
        { status: 'REVERSED',     enteredAt: nowIso(12) },
      ],
      createdAt: nowIso(12, 6),
      updatedAt: nowIso(12),
    },
    // Additional transfers to demonstrate pagination and filter variety.
    {
      id: 'txn_8839',
      reference: 'TXN-8839',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8839',
      recipientId: 'rcpt_amsterdam_commodities',
      sendCurrency: 'GBP',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 3_100_000, currency: 'GBP' },
      receiveAmount: { amountMinor: 647_404_000, currency: 'NGN' },
      tradeDescription: 'Palm kernel export',
      quote: baseQuote(2088.4, 3_100_000, 'GBP', 647_404_000),
      state: { status: 'COMPLETED', enteredAt: nowIso(15), payoutReference: 'PO-8839' },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(15, 8) },
        { status: 'QUOTED',       enteredAt: nowIso(15, 7) },
        { status: 'SCREENED',     enteredAt: nowIso(15, 5) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(15, 4) },
        { status: 'FUNDED',       enteredAt: nowIso(15, 3) },
        { status: 'SETTLING',     enteredAt: nowIso(15, 2) },
        { status: 'SETTLED',      enteredAt: nowIso(15, 1) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(15, 0) },
        { status: 'COMPLETED',    enteredAt: nowIso(15) },
      ],
      createdAt: nowIso(15, 8),
      updatedAt: nowIso(15),
    },
    {
      id: 'txn_8838',
      reference: 'TXN-8838',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8838',
      recipientId: 'rcpt_kerala_spices',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 920_000, currency: 'USD' },
      receiveAmount: { amountMinor: 151_358_400, currency: 'NGN' },
      tradeDescription: 'Pepper export',
      quote: baseQuote(1645.2, 920_000, 'USD', 151_358_400),
      state: { status: 'AWAITING_FUNDS', enteredAt: nowIso(2) },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(2, 4) },
        { status: 'QUOTED',       enteredAt: nowIso(2, 3) },
        { status: 'SCREENED',     enteredAt: nowIso(2, 2) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(2) },
      ],
      createdAt: nowIso(2, 4),
      updatedAt: nowIso(2),
    },
    {
      id: 'txn_8837',
      reference: 'TXN-8837',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8837',
      recipientId: 'rcpt_naturalia_foods',
      sendCurrency: 'EUR',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 5_500_000, currency: 'EUR' },
      receiveAmount: { amountMinor: 991_375_000, currency: 'NGN' },
      tradeDescription: 'Ginger export',
      quote: baseQuote(1802.5, 5_500_000, 'EUR', 991_375_000),
      state: { status: 'COMPLETED', enteredAt: nowIso(20), payoutReference: 'PO-8837' },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(20, 9) },
        { status: 'QUOTED',       enteredAt: nowIso(20, 8) },
        { status: 'SCREENED',     enteredAt: nowIso(20, 6) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(20, 5) },
        { status: 'FUNDED',       enteredAt: nowIso(20, 4) },
        { status: 'SETTLING',     enteredAt: nowIso(20, 3) },
        { status: 'SETTLED',      enteredAt: nowIso(20, 2) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(20, 1) },
        { status: 'COMPLETED',    enteredAt: nowIso(20) },
      ],
      createdAt: nowIso(20, 9),
      updatedAt: nowIso(20),
    },
    {
      id: 'txn_8836',
      reference: 'TXN-8836',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8836',
      recipientId: 'rcpt_rotterdam_grain',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 2_750_000, currency: 'USD' },
      receiveAmount: { amountMinor: 452_430_000, currency: 'NGN' },
      tradeDescription: 'Soybean export',
      quote: baseQuote(1645.2, 2_750_000, 'USD', 452_430_000),
      state: { status: 'REJECTED', enteredAt: nowIso(25), reason: 'Sanctions screening match — manual review required.' },
      history: [
        { status: 'CREATED',  enteredAt: nowIso(25, 4) },
        { status: 'QUOTED',   enteredAt: nowIso(25, 3) },
        { status: 'SCREENED', enteredAt: nowIso(25, 2) },
        { status: 'REJECTED', enteredAt: nowIso(25) },
      ],
      createdAt: nowIso(25, 4),
      updatedAt: nowIso(25),
    },
    {
      id: 'txn_8835',
      reference: 'TXN-8835',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8835',
      recipientId: 'rcpt_gupta_trading',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 3_400_000, currency: 'USD' },
      receiveAmount: { amountMinor: 559_368_000, currency: 'NGN' },
      tradeDescription: 'Cotton export',
      quote: baseQuote(1645.2, 3_400_000, 'USD', 559_368_000),
      state: { status: 'COMPLETED', enteredAt: nowIso(30), payoutReference: 'PO-8835' },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(30, 8) },
        { status: 'QUOTED',       enteredAt: nowIso(30, 7) },
        { status: 'SCREENED',     enteredAt: nowIso(30, 5) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(30, 4) },
        { status: 'FUNDED',       enteredAt: nowIso(30, 3) },
        { status: 'SETTLING',     enteredAt: nowIso(30, 2) },
        { status: 'SETTLED',      enteredAt: nowIso(30, 1) },
        { status: 'PAYING_OUT',   enteredAt: nowIso(30, 0) },
        { status: 'COMPLETED',    enteredAt: nowIso(30) },
      ],
      createdAt: nowIso(30, 8),
      updatedAt: nowIso(30),
    },
    {
      id: 'txn_8834',
      reference: 'TXN-8834',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8834',
      recipientId: 'rcpt_amsterdam_commodities',
      sendCurrency: 'USD',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 6_100_000, currency: 'USD' },
      receiveAmount: { amountMinor: 1_003_572_000, currency: 'NGN' },
      tradeDescription: 'Rubber export',
      quote: baseQuote(1645.2, 6_100_000, 'USD', 1_003_572_000),
      state: { status: 'SETTLING', enteredAt: nowIso(1) },
      history: [
        { status: 'CREATED',      enteredAt: nowIso(1, 7) },
        { status: 'QUOTED',       enteredAt: nowIso(1, 6) },
        { status: 'SCREENED',     enteredAt: nowIso(1, 5) },
        { status: 'AWAITING_FUNDS', enteredAt: nowIso(1, 4) },
        { status: 'FUNDED',       enteredAt: nowIso(1, 3) },
        { status: 'SETTLING',     enteredAt: nowIso(1) },
      ],
      createdAt: nowIso(1, 7),
      updatedAt: nowIso(1),
    },
    {
      id: 'txn_8833',
      reference: 'TXN-8833',
      customerId: DEMO_CUSTOMER_ID,
      idempotencyKey: 'seed-8833',
      recipientId: 'rcpt_naturalia_foods',
      sendCurrency: 'EUR',
      receiveCurrency: 'NGN',
      sendAmount: { amountMinor: 1_750_000, currency: 'EUR' },
      receiveAmount: { amountMinor: 315_437_500, currency: 'NGN' },
      tradeDescription: 'Shea butter export',
      quote: baseQuote(1802.5, 1_750_000, 'EUR', 315_437_500),
      state: { status: 'EXPIRED', enteredAt: nowIso(35) },
      history: [
        { status: 'CREATED', enteredAt: nowIso(35, 3) },
        { status: 'QUOTED',  enteredAt: nowIso(35, 2) },
        { status: 'EXPIRED', enteredAt: nowIso(35) },
      ],
      createdAt: nowIso(35, 3),
      updatedAt: nowIso(35),
    },
  ];
}

function seedRecipients() {
  const now = nowIso();
  const entries = [
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

function seedFxRates() {
  const now = nowIso();
  const entries = [
    ['USD/NGN', 1645.2, 0.32],
    ['EUR/NGN', 1802.5, -0.11],
    ['GBP/NGN', 2088.4, 0.18],
    ['GHS/NGN', 110.25, -0.44],
    // XSD is the platform's internal settlement asset — treated as a
    // non-national currency (ISO X-prefix convention) pegged 1:1 to USD
    // for conversion purposes. No "wallet", "stablecoin", or chain
    // vocabulary is exposed here or in any user-facing surface.
    ['USD/XSD', 1.0, 0.0],
    ['XSD/USD', 1.0, 0.0],
    ['EUR/XSD', 1.096, 0.01],
    ['XSD/EUR', 0.9124, -0.01],
    ['GBP/XSD', 1.271, 0.02],
    ['XSD/GBP', 0.7869, -0.02],
    ['NGN/XSD', 0.000608, 0.0],
    ['XSD/NGN', 1645.2, 0.32],
  ];
  return new Map(
    entries.map(([pair, rate, changePercent24h]) => {
      const [sendCurrency, receiveCurrency] = pair.split('/');
      return [pair, { sendCurrency, receiveCurrency, rate, changePercent24h, asOf: now }];
    }),
  );
}

export function createMockStore() {
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
      // XSD: platform settlement balance — X-prefix ISO convention for
      // non-national units (e.g. XAU for gold). No crypto vocabulary here.
      {
        accountId: 'acct_xsd',
        currency: 'XSD',
        balance: { amountMinor: 8_750_000, currency: 'XSD' },
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
    // Tracks external payout orders initiated from the /exchange page.
    settlementPayouts: [],
  };
}

export const store = createMockStore();
