/**
 * Minor-unit exponent per currency (2 = cents/kobo, matches ISO 4217).
 * Every currency in scope uses 2 today; kept as a lookup rather than a
 * constant so a future zero-decimal currency doesn't silently corrupt math.
 */
const MINOR_UNIT_EXPONENT = {
  NGN: 2,
  KES: 2,
  GHS: 2,
  ZAR: 2,
  XOF: 2,
  XAF: 2,
  EGP: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
};

const CURRENCY_SYMBOL = {
  NGN: '₦',
  KES: 'KSh',
  GHS: 'GH₵',
  ZAR: 'R',
  XOF: 'CFA',
  XAF: 'FCFA',
  EGP: 'E£',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function money(amountMinor, currency) {
  if (!Number.isInteger(amountMinor)) {
    throw new Error(`money() requires an integer minor-unit amount, got ${amountMinor}`);
  }
  return { amountMinor, currency };
}

function assertSameCurrency(a, b) {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot combine ${a.currency} and ${b.currency} amounts`);
  }
}

export function addMoney(a, b) {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMoney(a, b) {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function isNegative(m) {
  return m.amountMinor < 0;
}

export function compareMoney(a, b) {
  assertSameCurrency(a, b);
  return a.amountMinor - b.amountMinor;
}

/**
 * Major-unit float for display math ONLY (e.g. handing a number to
 * Intl.NumberFormat). Never feed this back into a Money — round-tripping
 * through float is exactly what Money exists to prevent.
 */
function toMajorUnits(m) {
  const exponent = MINOR_UNIT_EXPONENT[m.currency];
  return m.amountMinor / 10 ** exponent;
}

/**
 * The only path from a Money value to on-screen text. Renders with the
 * currency's real decimal precision, thousands separators, and (for NGN
 * amounts of 1,000,000+) the compact "N.NM" form seen in the dashboard
 * design — e.g. "₦74.0M" next to a full-precision amount elsewhere.
 */
export function formatMoney(m, options = {}) {
  const { useCode = false, hideCurrency = false, signDisplay = false } = options;
  const major = toMajorUnits(m);
  const exponent = MINOR_UNIT_EXPONENT[m.currency];

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
    signDisplay: signDisplay ? 'exceptZero' : 'auto',
  }).format(major);

  if (hideCurrency) return formatted;

  const marker = useCode ? `${m.currency} ` : CURRENCY_SYMBOL[m.currency];
  return signDisplay && major >= 0 ? `+${marker}${formatted.replace('+', '')}` : `${marker}${formatted}`;
}

/**
 * Compact form for tight spaces: "₦74.0M", "$45,000" (amounts under 1M stay
 * full precision since the design only compacts million-plus NGN figures).
 */
export function formatMoneyCompact(m) {
  const major = toMajorUnits(m);
  const symbol = CURRENCY_SYMBOL[m.currency];
  const abs = Math.abs(major);

  if (abs >= 1_000_000) {
    return `${major < 0 ? '-' : ''}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  return formatMoney(m);
}
