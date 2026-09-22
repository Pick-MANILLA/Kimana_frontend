'use client';

/**
 * ExchangePage — /exchange
 *
 * Three flows, each a mini-wizard:
 *   1. Convert local currency → settlement balance  (tab: 'to_settlement')
 *   2. Convert settlement balance → local currency  (tab: 'from_settlement')
 *   3. External payout of settlement balance        (tab: 'external_payout')
 *
 * "USDC" is the settlement unit code, shown to users by that name.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '../../api';
import { sessionQueryKey } from '../auth/useSession';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { LogoWithWordmark } from '../../components/ui/Logo';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  LogOutIcon,
  SpinnerIcon,
} from '../../components/ui/icons';
import {
  currencyName,
  exchangeCopy,
  payoutStatusDescription,
  payoutStatusLabel,
  payoutStatusTone,
} from '../../copy';
import { formatMoney, formatMoneyCompact } from '../../money/money';
import { formatShortDate } from '../../lib/formatDate';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'to_settlement', label: exchangeCopy.tabs.toSettlement },
  { id: 'from_settlement', label: exchangeCopy.tabs.fromSettlement },
  { id: 'external_payout', label: exchangeCopy.tabs.externalPayout },
];

const QUOTE_TTL_MS = 90_000;

// Currencies available as source/dest for conversion flows.
// Matches the FX pairs seeded: USD, EUR, GBP supported; NGN for completeness.
const LOCAL_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN'];

function formatTimer(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/** Parse a decimal string from a text field to minor-unit integer. */
function parseMinorUnits(str, currency) {
  const cleaned = str.replace(/[^0-9.]/g, '');
  const major = parseFloat(cleaned);
  if (!isFinite(major) || major <= 0) return null;
  return Math.round(major * 100);
}

/** Convert minor units to a display string for pre-filling inputs. */
function minorToDisplayString(amountMinor) {
  return (amountMinor / 100).toFixed(2);
}

function generateIdempotencyKey() {
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Header shared across all exchange page views. */
function ExchangeHeader({ onBack }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Sign the user out locally regardless — a failed logout call shouldn't trap them in the app.
    }
    queryClient.removeQueries({ queryKey: sessionQueryKey });
    router.push('/login');
  };

  return (
    <header
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <div className="flex items-center gap-4">
        <LogoWithWordmark size={28} />
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Back to dashboard"
          >
            <ArrowLeftIcon size={16} color="currentColor" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle size={28} />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:bg-rose-500/10 hover:text-rose-400"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-subtle)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <LogOutIcon size={14} color="currentColor" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

/** Settlement balance display card. */
function SettlementBalanceCard({ balance, loading }) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          {exchangeCopy.settlementBalanceLabel}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ background: 'var(--color-brand-800)', color: 'var(--color-brand-200)' }}
        >
          {exchangeCopy.settlementBalanceCurrencyCode}
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 mt-1">
          <SpinnerIcon size={18} color="var(--color-text-secondary)" />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading…</span>
        </div>
      ) : balance ? (
        <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {formatMoney(balance.balance, { useCode: true })}
        </p>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Unavailable</p>
      )}
      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {exchangeCopy.settlementBalanceDescription}
      </p>
    </div>
  );
}

/** Indicative rate display. */
function IndicativeRateRow({ rate, loading, noRateMessage }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <SpinnerIcon size={13} color="currentColor" />
        <span>{exchangeCopy.convertIn.loadingRate}</span>
      </div>
    );
  }
  if (!rate) {
    return (
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {noRateMessage ?? exchangeCopy.convertIn.noRate}
      </p>
    );
  }
  return (
    <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
      Indicative rate: <span style={{ color: 'var(--color-text-primary)' }}>1 {rate.sendCurrency} = {rate.rate.toFixed(rate.receiveCurrency === 'USDC' || rate.sendCurrency === 'USDC' ? 4 : 2)} {rate.receiveCurrency}</span>
    </p>
  );
}

/** Quote countdown bar. */
function QuoteCountdown({ expiresAt, onExpired }) {
  const [remaining, setRemaining] = useState(() => new Date(expiresAt) - Date.now());

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.();
      return;
    }
    const id = setInterval(() => {
      const left = new Date(expiresAt) - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        onExpired?.();
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const pct = Math.max(0, Math.min(100, (remaining / QUOTE_TTL_MS) * 100));
  const urgent = remaining < 20_000;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <ClockIcon size={13} color={urgent ? 'var(--color-warning)' : 'var(--color-text-secondary)'} />
        <span
          className="text-xs font-medium tabular-nums"
          style={{ color: urgent ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}
        >
          {exchangeCopy.quote.quoteExpiresIn}: {formatTimer(remaining)}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden"
        style={{ background: 'var(--color-surface-2)' }}
        role="progressbar"
        aria-label="Quote expiry countdown"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: urgent ? 'var(--color-warning)' : 'var(--color-brand-600)',
            // Respect prefers-reduced-motion — transition on width is purely decorative
            transition: 'width 0.5s linear',
          }}
        />
      </div>
    </div>
  );
}

/** Cost breakdown table reused across all three quote screens. */
function QuoteBreakdown({ quote, isPayoutQuote }) {
  const { breakdown } = quote;
  const hasFee = breakdown.fee?.amountMinor > 0;

  const rows = isPayoutQuote
    ? [
        { label: exchangeCopy.quote.breakdown.youSend, value: formatMoney(breakdown.sendAmount, { useCode: true }) },
        { label: exchangeCopy.quote.breakdown.fee, value: hasFee ? formatMoney(breakdown.fee, { useCode: true }) : exchangeCopy.quote.breakdown.noFee },
        { label: exchangeCopy.quote.breakdown.youReceive, value: formatMoney(breakdown.receiveAmount, { useCode: true }), highlight: true },
        ...(quote.destinationReference ? [{ label: exchangeCopy.quote.breakdown.destination, value: truncateRef(quote.destinationReference) }] : []),
      ]
    : [
        { label: exchangeCopy.quote.breakdown.youSend, value: formatMoney(breakdown.sendAmount, { useCode: true }) },
        {
          label: exchangeCopy.quote.breakdown.rate,
          value: `1 ${quote.sendCurrency} = ${breakdown.rate.toFixed(
            quote.receiveCurrency === 'USDC' || quote.sendCurrency === 'USDC' ? 4 : 2,
          )} ${quote.receiveCurrency}`,
        },
        { label: exchangeCopy.quote.breakdown.fee, value: hasFee ? formatMoney(breakdown.fee, { useCode: true }) : exchangeCopy.quote.breakdown.noFee },
        { label: exchangeCopy.quote.breakdown.youReceive, value: formatMoney(breakdown.receiveAmount, { useCode: true }), highlight: true },
      ];

  return (
    <dl className="divide-y rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
      {rows.map(({ label, value, highlight }) => (
        <div key={label} className="flex items-center justify-between px-4 py-3">
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: highlight ? 'var(--color-success)' : 'var(--color-text-primary)' }}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function truncateRef(ref) {
  if (!ref) return '';
  if (ref.length <= 16) return ref;
  return `${ref.slice(0, 8)}…${ref.slice(-6)}`;
}

/** Error banner reused across all flows. */
function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{ background: 'var(--color-danger)', color: 'var(--color-on-danger)' }}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-semibold underline text-xs"
          style={{ color: 'var(--color-on-danger)' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/** Payout history table. */
function PayoutHistoryTable({ payouts }) {
  if (!payouts || payouts.length === 0) {
    return (
      <p className="text-sm py-6 text-center" style={{ color: 'var(--color-text-secondary)' }}>
        {exchangeCopy.payoutHistory.empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border-subtle)' }}>
            {[
              exchangeCopy.payoutHistory.reference,
              exchangeCopy.payoutHistory.amount,
              exchangeCopy.payoutHistory.destination,
              exchangeCopy.payoutHistory.status,
              exchangeCopy.payoutHistory.date,
            ].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payouts.map((p, idx) => (
            <tr
              key={p.id}
              style={{
                background: idx % 2 === 0 ? 'var(--color-surface-1)' : 'var(--color-canvas)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {p.reference}
              </td>
              <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {formatMoneyCompact(p.sendAmount)}
              </td>
              <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-text-secondary)', maxWidth: '14rem' }}>
                <span className="block truncate">{truncateRef(p.destinationReference)}</span>
              </td>
              <td className="px-4 py-3">
                <Badge tone={payoutStatusTone[p.status]}>
                  {payoutStatusLabel[p.status] ?? p.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {formatShortDate(p.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flow: Convert local → settlement  (to_settlement)
// ---------------------------------------------------------------------------

function ConvertInFlow({ settlementBalance, localBalances, onConversionComplete }) {
  const [step, setStep] = useState('form'); // 'form' | 'quote' | 'success'
  const [currency, setCurrency] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [indicativeRate, setIndicativeRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyKey());
  const [quoteExpired, setQuoteExpired] = useState(false);

  // Fetch indicative rate whenever currency changes.
  useEffect(() => {
    if (!currency) { setIndicativeRate(null); return; }
    let cancelled = false;
    setRateLoading(true);
    api.settlement.getIndicativeRate(currency, 'USDC')
      .then((r) => { if (!cancelled) setIndicativeRate(r); })
      .catch(() => { if (!cancelled) setIndicativeRate(null); })
      .finally(() => { if (!cancelled) setRateLoading(false); });
    return () => { cancelled = true; };
  }, [currency]);

  const sourceBalance = localBalances?.find((b) => b.currency === currency);

  function validate() {
    const errs = {};
    if (!currency) errs.currency = exchangeCopy.errors.currencyRequired;
    const minor = parseMinorUnits(amountStr, currency);
    if (minor === null) errs.amount = exchangeCopy.errors.amountRequired;
    else if (minor <= 0) errs.amount = exchangeCopy.errors.amountPositive;
    else if (sourceBalance && minor > sourceBalance.balance.amountMinor) {
      errs.amount = exchangeCopy.errors.amountExceedsBalance;
    }
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleGetQuote() {
    if (!validate()) return;
    setQuoteLoading(true);
    setError('');
    try {
      const minor = parseMinorUnits(amountStr, currency);
      const q = await api.settlement.requestConversionQuote({
        sendCurrency: currency,
        receiveCurrency: 'USDC',
        amountField: 'send',
        amount: { amountMinor: minor, currency },
      });
      setQuote(q);
      setQuoteExpired(false);
      setStep('quote');
    } catch (e) {
      setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleConfirm() {
    if (!quote) return;
    setConfirmLoading(true);
    setError('');
    try {
      const res = await api.settlement.executeConversion({
        quoteId: quote.id,
        quote,
        idempotencyKey,
      });
      setResult(res);
      setStep('success');
      onConversionComplete?.();
    } catch (e) {
      if (e.code === 'QUOTE_EXPIRED') {
        setQuoteExpired(true);
        setError(exchangeCopy.errors.quoteExpired);
      } else {
        // Rotate idempotency key on a non-idempotent retry scenario.
        setIdempotencyKey(generateIdempotencyKey());
        setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleRequote() {
    setQuote(null);
    setQuoteExpired(false);
    setError('');
    setIdempotencyKey(generateIdempotencyKey());
    setStep('form');
  }

  function handleDone() {
    setStep('form');
    setAmountStr('');
    setCurrency('');
    setResult(null);
    setQuote(null);
    setIndicativeRate(null);
    setIdempotencyKey(generateIdempotencyKey());
  }

  const currencyOptions = LOCAL_CURRENCIES.map((c) => ({ value: c, label: `${c} — ${currencyName[c] ?? c}` }));

  if (step === 'success' && result) {
    return (
      <div className="space-y-6 max-w-md mx-auto pt-4">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircleIcon size={48} color="var(--color-success)" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.success.conversionTitle}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.success.conversionBody}
          </p>
        </div>

        <dl className="divide-y rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.success.reference}</dt>
            <dd className="text-sm font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>{result.reference}</dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youSend}</dt>
            <dd className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(result.sendAmount, { useCode: true })}</dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youReceive}</dt>
            <dd className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>{formatMoney(result.receiveAmount, { useCode: true })}</dd>
          </div>
        </dl>

        <Button onClick={handleDone} className="w-full">
          {exchangeCopy.success.goBack}
        </Button>
      </div>
    );
  }

  if (step === 'quote' && quote) {
    return (
      <div className="space-y-5 max-w-md mx-auto pt-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.quote.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.convertIn.subtitle}
          </p>
        </div>

        {quoteExpired ? (
          <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
            {exchangeCopy.quote.quoteExpired}
          </p>
        ) : (
          <QuoteCountdown expiresAt={quote.expiresAt} onExpired={() => setQuoteExpired(true)} />
        )}

        <QuoteBreakdown quote={quote} isPayoutQuote={false} />

        <ErrorBanner message={error} />

        <div className="flex gap-3 flex-wrap">
          {quoteExpired ? (
            <Button onClick={handleRequote} className="flex-1">
              {exchangeCopy.quote.requote}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleRequote} className="flex-1" disabled={confirmLoading}>
                {exchangeCopy.quote.back}
              </Button>
              <Button onClick={handleConfirm} className="flex-1" disabled={confirmLoading}>
                {confirmLoading ? (
                  <><SpinnerIcon size={14} color="currentColor" /> {exchangeCopy.quote.processing}</>
                ) : exchangeCopy.quote.confirm}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step: form
  return (
    <div className="space-y-5 max-w-md mx-auto pt-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {exchangeCopy.convertIn.title}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {exchangeCopy.convertIn.subtitle}
        </p>
      </div>

      <SelectField
        label={exchangeCopy.convertIn.sourceLabel}
        placeholder={exchangeCopy.convertIn.sourcePlaceholder}
        options={currencyOptions}
        value={currency}
        onChange={(e) => { setCurrency(e.target.value); setFieldError((p) => ({ ...p, currency: undefined })); }}
        error={fieldError.currency}
      />

      {sourceBalance && (
        <p className="text-xs -mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          Available: <span className="font-semibold">{formatMoney(sourceBalance.balance, { useCode: true })}</span>
        </p>
      )}

      <TextField
        label={exchangeCopy.convertIn.amountLabel}
        placeholder={exchangeCopy.convertIn.amountPlaceholder}
        inputMode="decimal"
        value={amountStr}
        onChange={(e) => { setAmountStr(e.target.value); setFieldError((p) => ({ ...p, amount: undefined })); }}
        error={fieldError.amount}
        aria-describedby="convert-in-rate"
      />

      <div id="convert-in-rate">
        <IndicativeRateRow
          rate={indicativeRate}
          loading={rateLoading}
          noRateMessage={exchangeCopy.convertIn.noRate}
        />
      </div>

      <ErrorBanner message={error} />

      <Button onClick={handleGetQuote} disabled={quoteLoading} className="w-full">
        {quoteLoading ? (
          <><SpinnerIcon size={14} color="currentColor" /> {exchangeCopy.convertIn.loadingRate}</>
        ) : exchangeCopy.convertIn.getQuote}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flow: Convert settlement → local  (from_settlement)
// ---------------------------------------------------------------------------

function ConvertOutFlow({ settlementBalance, onConversionComplete }) {
  const [step, setStep] = useState('form');
  const [currency, setCurrency] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [indicativeRate, setIndicativeRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyKey());
  const [quoteExpired, setQuoteExpired] = useState(false);

  useEffect(() => {
    if (!currency) { setIndicativeRate(null); return; }
    let cancelled = false;
    setRateLoading(true);
    api.settlement.getIndicativeRate('USDC', currency)
      .then((r) => { if (!cancelled) setIndicativeRate(r); })
      .catch(() => { if (!cancelled) setIndicativeRate(null); })
      .finally(() => { if (!cancelled) setRateLoading(false); });
    return () => { cancelled = true; };
  }, [currency]);

  function validate() {
    const errs = {};
    if (!currency) errs.currency = exchangeCopy.errors.currencyRequired;
    const minor = parseMinorUnits(amountStr, 'USDC');
    if (minor === null) errs.amount = exchangeCopy.errors.amountRequired;
    else if (minor <= 0) errs.amount = exchangeCopy.errors.amountPositive;
    else if (settlementBalance && minor > settlementBalance.balance.amountMinor) {
      errs.amount = exchangeCopy.errors.amountExceedsBalance;
    }
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleGetQuote() {
    if (!validate()) return;
    setQuoteLoading(true);
    setError('');
    try {
      const minor = parseMinorUnits(amountStr, 'USDC');
      const q = await api.settlement.requestConversionQuote({
        sendCurrency: 'USDC',
        receiveCurrency: currency,
        amountField: 'send',
        amount: { amountMinor: minor, currency: 'USDC' },
      });
      setQuote(q);
      setQuoteExpired(false);
      setStep('quote');
    } catch (e) {
      setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleConfirm() {
    if (!quote) return;
    setConfirmLoading(true);
    setError('');
    try {
      const res = await api.settlement.executeConversion({ quoteId: quote.id, quote, idempotencyKey });
      setResult(res);
      setStep('success');
      onConversionComplete?.();
    } catch (e) {
      if (e.code === 'QUOTE_EXPIRED') {
        setQuoteExpired(true);
        setError(exchangeCopy.errors.quoteExpired);
      } else {
        setIdempotencyKey(generateIdempotencyKey());
        setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleRequote() {
    setQuote(null);
    setQuoteExpired(false);
    setError('');
    setIdempotencyKey(generateIdempotencyKey());
    setStep('form');
  }

  function handleDone() {
    setStep('form');
    setAmountStr('');
    setCurrency('');
    setResult(null);
    setQuote(null);
    setIndicativeRate(null);
    setIdempotencyKey(generateIdempotencyKey());
  }

  const currencyOptions = LOCAL_CURRENCIES.map((c) => ({ value: c, label: `${c} — ${currencyName[c] ?? c}` }));

  if (step === 'success' && result) {
    return (
      <div className="space-y-6 max-w-md mx-auto pt-4">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircleIcon size={48} color="var(--color-success)" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.success.conversionTitle}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.success.conversionBody}
          </p>
        </div>
        <dl className="divide-y rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.success.reference}</dt>
            <dd className="text-sm font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>{result.reference}</dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youSend}</dt>
            <dd className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(result.sendAmount, { useCode: true })}</dd>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youReceive}</dt>
            <dd className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>{formatMoney(result.receiveAmount, { useCode: true })}</dd>
          </div>
        </dl>
        <Button onClick={handleDone} className="w-full">{exchangeCopy.success.goBack}</Button>
      </div>
    );
  }

  if (step === 'quote' && quote) {
    return (
      <div className="space-y-5 max-w-md mx-auto pt-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.quote.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.convertOut.subtitle}
          </p>
        </div>

        {quoteExpired ? (
          <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
            {exchangeCopy.quote.quoteExpired}
          </p>
        ) : (
          <QuoteCountdown expiresAt={quote.expiresAt} onExpired={() => setQuoteExpired(true)} />
        )}

        <QuoteBreakdown quote={quote} isPayoutQuote={false} />
        <ErrorBanner message={error} />

        <div className="flex gap-3 flex-wrap">
          {quoteExpired ? (
            <Button onClick={handleRequote} className="flex-1">{exchangeCopy.quote.requote}</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleRequote} className="flex-1" disabled={confirmLoading}>
                {exchangeCopy.quote.back}
              </Button>
              <Button onClick={handleConfirm} className="flex-1" disabled={confirmLoading}>
                {confirmLoading
                  ? <><SpinnerIcon size={14} color="currentColor" /> {exchangeCopy.quote.processing}</>
                  : exchangeCopy.quote.confirm}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Step: form
  return (
    <div className="space-y-5 max-w-md mx-auto pt-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {exchangeCopy.convertOut.title}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {exchangeCopy.convertOut.subtitle}
        </p>
      </div>

      {settlementBalance && (
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Settlement balance: <span className="font-semibold">{formatMoney(settlementBalance.balance, { useCode: true })}</span>
        </p>
      )}

      <TextField
        label={exchangeCopy.convertOut.amountLabel}
        placeholder={exchangeCopy.convertOut.amountPlaceholder}
        inputMode="decimal"
        value={amountStr}
        onChange={(e) => { setAmountStr(e.target.value); setFieldError((p) => ({ ...p, amount: undefined })); }}
        error={fieldError.amount}
      />

      <SelectField
        label={exchangeCopy.convertOut.destinationLabel}
        placeholder={exchangeCopy.convertOut.destinationPlaceholder}
        options={currencyOptions}
        value={currency}
        onChange={(e) => { setCurrency(e.target.value); setFieldError((p) => ({ ...p, currency: undefined })); }}
        error={fieldError.currency}
      />

      <IndicativeRateRow
        rate={indicativeRate}
        loading={rateLoading}
        noRateMessage={exchangeCopy.convertOut.noRate}
      />

      <ErrorBanner message={error} />

      <Button onClick={handleGetQuote} disabled={quoteLoading} className="w-full">
        {quoteLoading
          ? <><SpinnerIcon size={14} color="currentColor" /> {exchangeCopy.convertOut.loadingRate}</>
          : exchangeCopy.convertOut.getQuote}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flow: External payout  (external_payout)
// ---------------------------------------------------------------------------

function ExternalPayoutFlow({ settlementBalance, onPayoutSubmitted }) {
  const [step, setStep] = useState('form'); // 'form' | 'quote' | 'tracking'
  const [amountStr, setAmountStr] = useState('');
  const [destRef, setDestRef] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [payout, setPayout] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => generateIdempotencyKey());
  const [quoteExpired, setQuoteExpired] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  // Simulation ticker: advances payout status through the state machine.
  const tickerRef = useRef(null);
  const startTicker = useCallback((payoutId) => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = setInterval(async () => {
      try {
        const updated = await api.settlement.advancePayoutStatus(payoutId);
        setPayout(updated);
        setPayouts((prev) => prev.map((p) => (p.id === payoutId ? updated : p)));
        const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);
        if (TERMINAL.has(updated.status)) {
          clearInterval(tickerRef.current);
          tickerRef.current = null;
        }
      } catch (_) {
        // Non-fatal — ticker will retry next interval.
      }
    }, 2500);
  }, []);

  // Stop ticker on unmount.
  useEffect(() => () => { if (tickerRef.current) clearInterval(tickerRef.current); }, []);

  // Load payout history when entering tracking step.
  useEffect(() => {
    if (step !== 'tracking') return;
    setPayoutsLoading(true);
    api.settlement.listPayouts()
      .then(setPayouts)
      .catch(() => {})
      .finally(() => setPayoutsLoading(false));
  }, [step]);

  function validate() {
    const errs = {};
    const minor = parseMinorUnits(amountStr, 'USDC');
    if (minor === null) errs.amount = exchangeCopy.errors.amountRequired;
    else if (minor <= 0) errs.amount = exchangeCopy.errors.amountPositive;
    else if (settlementBalance && minor > settlementBalance.balance.amountMinor) {
      errs.amount = exchangeCopy.errors.amountExceedsBalance;
    }
    const trimmedRef = destRef.trim();
    if (!trimmedRef) errs.destRef = exchangeCopy.errors.destinationRequired;
    else if (trimmedRef.length < 6) errs.destRef = exchangeCopy.errors.destinationTooShort;
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleGetQuote() {
    if (!validate()) return;
    setQuoteLoading(true);
    setError('');
    try {
      const minor = parseMinorUnits(amountStr, 'USDC');
      const q = await api.settlement.requestPayoutQuote({
        amount: { amountMinor: minor, currency: 'USDC' },
        destinationReference: destRef.trim(),
      });
      setQuote(q);
      setQuoteExpired(false);
      setStep('quote');
    } catch (e) {
      setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleConfirm() {
    if (!quote) return;
    setConfirmLoading(true);
    setError('');
    try {
      const result = await api.settlement.executePayout({ quote, idempotencyKey });
      setPayout(result);
      setPayouts([result]);
      setStep('tracking');
      onPayoutSubmitted?.();
      startTicker(result.id);
    } catch (e) {
      if (e.code === 'QUOTE_EXPIRED') {
        setQuoteExpired(true);
        setError(exchangeCopy.errors.quoteExpired);
      } else {
        setIdempotencyKey(generateIdempotencyKey());
        setError(e.code === 'NETWORK' ? exchangeCopy.errors.network : (e.message || exchangeCopy.errors.generic));
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  function handleRequote() {
    setQuote(null);
    setQuoteExpired(false);
    setError('');
    setIdempotencyKey(generateIdempotencyKey());
    setStep('form');
  }

  function handleNewPayout() {
    setStep('form');
    setAmountStr('');
    setDestRef('');
    setQuote(null);
    setPayout(null);
    setIdempotencyKey(generateIdempotencyKey());
    setError('');
  }

  // ── Tracking step ──────────────────────────────────────────────────────
  if (step === 'tracking') {
    const currentPayout = payout;
    const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);
    const isTerminal = currentPayout ? TERMINAL.has(currentPayout.status) : false;

    return (
      <div className="space-y-6 max-w-lg mx-auto pt-4">
        {/* Active payout status */}
        {currentPayout && (
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ background: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {exchangeCopy.success.payoutTitle}
                </h2>
                <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                  {currentPayout.reference}
                </p>
              </div>
              <Badge tone={payoutStatusTone[currentPayout.status]}>
                {payoutStatusLabel[currentPayout.status] ?? currentPayout.status}
              </Badge>
            </div>

            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {payoutStatusDescription[currentPayout.status]}
            </p>

            {/* State timeline */}
            <ol className="space-y-2 pt-1" aria-label="Payout progress">
              {currentPayout.history.map((h, idx) => {
                const isLatest = idx === currentPayout.history.length - 1;
                return (
                  <li key={`${h.status}-${idx}`} className="flex items-center gap-3">
                    <CheckCircleIcon
                      size={16}
                      color={isLatest && !isTerminal ? 'var(--color-brand-400)' : 'var(--color-success)'}
                    />
                    <span className="text-xs" style={{ color: isLatest ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                      {payoutStatusLabel[h.status] ?? h.status}
                    </span>
                    {!isTerminal && isLatest && (
                      <SpinnerIcon size={13} color="var(--color-brand-400)" />
                    )}
                  </li>
                );
              })}
            </ol>

            <dl className="divide-y rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
              <div className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youSend}</dt>
                <dd className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatMoney(currentPayout.sendAmount, { useCode: true })}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.youReceive}</dt>
                <dd className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>{formatMoney(currentPayout.receiveAmount, { useCode: true })}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{exchangeCopy.quote.breakdown.destination}</dt>
                <dd className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)', maxWidth: '14rem' }}>
                  <span className="block truncate">{truncateRef(currentPayout.destinationReference)}</span>
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Full payout history */}
        <div>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.payoutHistory.title}
          </h3>
          {payoutsLoading ? (
            <div className="flex items-center gap-2 py-4">
              <SpinnerIcon size={16} color="var(--color-text-secondary)" />
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading…</span>
            </div>
          ) : (
            <PayoutHistoryTable payouts={payouts} />
          )}
        </div>

        <Button onClick={handleNewPayout} variant="outline" className="w-full">
          {exchangeCopy.payout.getQuote === exchangeCopy.payout.getQuote ? exchangeCopy.success.goBack : exchangeCopy.success.goBack}
        </Button>
      </div>
    );
  }

  // ── Quote step ─────────────────────────────────────────────────────────
  if (step === 'quote' && quote) {
    return (
      <div className="space-y-5 max-w-md mx-auto pt-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.quote.payoutTitle}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.payout.subtitle}
          </p>
        </div>

        {quoteExpired ? (
          <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
            {exchangeCopy.quote.quoteExpired}
          </p>
        ) : (
          <QuoteCountdown expiresAt={quote.expiresAt} onExpired={() => setQuoteExpired(true)} />
        )}

        <QuoteBreakdown quote={quote} isPayoutQuote />
        <ErrorBanner message={error} />

        <div className="flex gap-3 flex-wrap">
          {quoteExpired ? (
            <Button onClick={handleRequote} className="flex-1">{exchangeCopy.quote.requote}</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleRequote} className="flex-1" disabled={confirmLoading}>
                {exchangeCopy.quote.back}
              </Button>
              <Button onClick={handleConfirm} className="flex-1" disabled={confirmLoading}>
                {confirmLoading
                  ? <><SpinnerIcon size={14} color="currentColor" /> {exchangeCopy.quote.processing}</>
                  : exchangeCopy.quote.confirm}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Form step ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-md mx-auto pt-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {exchangeCopy.payout.title}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {exchangeCopy.payout.subtitle}
        </p>
      </div>

      {settlementBalance && (
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Settlement balance: <span className="font-semibold">{formatMoney(settlementBalance.balance, { useCode: true })}</span>
        </p>
      )}

      <TextField
        label={exchangeCopy.payout.amountLabel}
        placeholder={exchangeCopy.payout.amountPlaceholder}
        inputMode="decimal"
        value={amountStr}
        onChange={(e) => { setAmountStr(e.target.value); setFieldError((p) => ({ ...p, amount: undefined })); }}
        error={fieldError.amount}
      />

      <div>
        <TextField
          label={exchangeCopy.payout.destinationRefLabel}
          placeholder={exchangeCopy.payout.destinationRefPlaceholder}
          value={destRef}
          onChange={(e) => { setDestRef(e.target.value); setFieldError((p) => ({ ...p, destRef: undefined })); }}
          error={fieldError.destRef}
          aria-describedby="dest-ref-hint"
          autoComplete="off"
          spellCheck={false}
        />
        <p id="dest-ref-hint" className="mt-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {exchangeCopy.payout.destinationRefHint}
        </p>
      </div>

      <ErrorBanner message={error} />

      <Button onClick={handleGetQuote} disabled={quoteLoading} className="w-full">
        {quoteLoading
          ? <><SpinnerIcon size={14} color="currentColor" /> Loading…</>
          : exchangeCopy.payout.getQuote}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExchangePage root
// ---------------------------------------------------------------------------

export function ExchangePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('to_settlement');
  const [settlementBalance, setSettlementBalance] = useState(null);
  const [localBalances, setLocalBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  function triggerBalanceRefresh() {
    setRefreshTick((t) => t + 1);
  }

  useEffect(() => {
    setBalanceLoading(true);
    setBalanceError('');
    Promise.all([
      api.settlement.getSettlementBalance(),
      api.settlement.getLocalBalances(),
    ])
      .then(([sb, lb]) => {
        setSettlementBalance(sb);
        setLocalBalances(lb);
      })
      .catch(() => setBalanceError(exchangeCopy.errors.generic))
      .finally(() => setBalanceLoading(false));
  }, [refreshTick]);

  const handleBack = () => router.push('/dashboard');

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{ background: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}
    >
      <ExchangeHeader onBack={handleBack} />

      <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            {exchangeCopy.pageTitle}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {exchangeCopy.pageSubtitle}
          </p>
        </div>

        {/* Settlement balance banner */}
        {balanceError ? (
          <ErrorBanner message={balanceError} onRetry={triggerBalanceRefresh} />
        ) : (
          <div className="mb-8">
            <SettlementBalanceCard balance={settlementBalance} loading={balanceLoading} />
          </div>
        )}

        {/* Tab bar */}
        <div
          className="flex gap-1 rounded-xl p-1 mb-8 overflow-x-auto"
          style={{ background: 'var(--color-surface-1)' }}
          role="tablist"
          aria-label="Exchange flows"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: isActive ? 'var(--color-surface-2)' : 'transparent',
                  color: isActive ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div
          id={`tabpanel-to_settlement`}
          role="tabpanel"
          aria-labelledby="tab-to_settlement"
          hidden={activeTab !== 'to_settlement'}
        >
          {activeTab === 'to_settlement' && (
            <ConvertInFlow
              settlementBalance={settlementBalance}
              localBalances={localBalances}
              onConversionComplete={triggerBalanceRefresh}
            />
          )}
        </div>

        <div
          id={`tabpanel-from_settlement`}
          role="tabpanel"
          aria-labelledby="tab-from_settlement"
          hidden={activeTab !== 'from_settlement'}
        >
          {activeTab === 'from_settlement' && (
            <ConvertOutFlow
              settlementBalance={settlementBalance}
              onConversionComplete={triggerBalanceRefresh}
            />
          )}
        </div>

        <div
          id={`tabpanel-external_payout`}
          role="tabpanel"
          aria-labelledby="tab-external_payout"
          hidden={activeTab !== 'external_payout'}
        >
          {activeTab === 'external_payout' && (
            <ExternalPayoutFlow
              settlementBalance={settlementBalance}
              onPayoutSubmitted={triggerBalanceRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}
