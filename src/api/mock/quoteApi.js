import { apiError, simulateNetwork } from './simulate';
import { store } from './seed';

const QUOTE_TTL_MS = 90_000;

async function getIndicativeRate(sendCurrency, receiveCurrency) {
  await simulateNetwork({ minMs: 150, maxMs: 400, failureRate: 0.02 });
  const key = `${sendCurrency}/${receiveCurrency}`;
  const cached = store.fxRates.get(key);
  if (cached) {
    // Small jitter each poll so the "live" rate visibly moves, like the real market.
    const jitter = 1 + (Math.random() - 0.5) * 0.004;
    const rate = { ...cached, rate: Math.round(cached.rate * jitter * 100) / 100, asOf: new Date().toISOString() };
    store.fxRates.set(key, rate);
    return rate;
  }
  throw apiError('VALIDATION', `No rate available for ${key}.`, false);
}

export const quoteApi = {
  getIndicativeRate,

  async requestFirmQuote(input) {
    await simulateNetwork();
    const indicative = await getIndicativeRate(input.sendCurrency, input.receiveCurrency);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + QUOTE_TTL_MS);

    const sendAmount =
      input.amountField === 'send'
        ? input.amount
        : { amountMinor: Math.round(input.amount.amountMinor / indicative.rate), currency: input.sendCurrency };
    const receiveAmount =
      input.amountField === 'receive'
        ? input.amount
        : { amountMinor: Math.round(input.amount.amountMinor * indicative.rate), currency: input.receiveCurrency };

    return {
      id: `quote_${Math.random().toString(36).slice(2, 10)}`,
      sendCurrency: input.sendCurrency,
      receiveCurrency: input.receiveCurrency,
      breakdown: {
        rate: indicative.rate,
        fee: { amountMinor: 0, currency: input.sendCurrency },
        sendAmount,
        receiveAmount,
      },
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  },
};
