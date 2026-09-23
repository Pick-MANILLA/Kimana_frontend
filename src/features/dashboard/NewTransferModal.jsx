'use client';

import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ShieldIcon,
  SpinnerIcon,
  XIcon,
} from '../../components/ui/icons';

const QUOTE_TTL_SECONDS = 120;
const INITIAL_RATE = 1645;
const COMPLIANCE_DESK_EMAIL = 'compliance@kimana.io';
const SIMULATED_FAILURE_RATE = 0.1;

const LIFECYCLE_STEPS = [
  { state: 'CREATED', label: '1. Created', desc: 'Transfer order registered in Kimana ledger.' },
  { state: 'QUOTED', label: '2. Quoted', desc: 'FX rate locked for this transfer.' },
  { state: 'SCREENED', label: '3. Screened', desc: 'Automated Sanctions & NIBSS KYB check cleared.' },
  { state: 'FUNDED', label: '4. Funded', desc: 'Local NIP payment received & verified.' },
  { state: 'SETTLING', label: '5. Settling', desc: 'Automated double-entry currency conversion in progress.' },
  { state: 'PAYING_OUT', label: '6. Paying Out', desc: 'Correspondent bank dispatch to beneficiary.' },
  { state: 'COMPLETED', label: '7. Completed', desc: 'Beneficiary account credited & audit receipt generated.' },
];

const SCREENED_INDEX = LIFECYCLE_STEPS.findIndex((s) => s.state === 'SCREENED');
const PAYING_OUT_INDEX = LIFECYCLE_STEPS.findIndex((s) => s.state === 'PAYING_OUT');

const SETTLEMENT_ISSUES = {
  COMPLIANCE_HOLD: {
    stepIndex: SCREENED_INDEX,
    badge: 'ON HOLD',
    tone: 'danger',
    title: 'Transfer on compliance hold',
    message:
      'Sanctions screening flagged this beneficiary for manual review. No funds have moved. Our compliance desk will confirm the next steps, usually within one business day.',
  },
  PAYOUT_DELAYED: {
    stepIndex: PAYING_OUT_INDEX,
    badge: 'DELAYED',
    tone: 'warning',
    title: 'Payout delayed by the correspondent bank',
    message:
      'The correspondent bank did not confirm the payout in time. Your funds are safe and the FX rate stays locked. Retry settlement to resend the payout instruction.',
  },
};

const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
const ACCOUNT_NUMBER_PATTERN = /^[A-Z0-9]{6,34}$/;

function parseAmount(value) {
  return Number(String(value).replace(/,/g, '').trim());
}

function validateDetails({ recipientName, accountNumber, amount }) {
  const errors = {};

  if (recipientName.trim().length < 2) {
    errors.recipientName = 'Enter the recipient or company name.';
  }

  const account = accountNumber.replace(/\s+/g, '').toUpperCase();
  if (!account) {
    errors.accountNumber = 'Enter the beneficiary account or IBAN number.';
  } else if (/^[A-Z]{2}/.test(account) ? !IBAN_PATTERN.test(account) : !ACCOUNT_NUMBER_PATTERN.test(account)) {
    errors.accountNumber = 'Enter a valid IBAN (e.g. NL91INGB0001234567) or account number.';
  }

  const numericAmount = parseAmount(amount);
  if (!String(amount).trim()) {
    errors.amount = 'Enter the amount to send.';
  } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.amount = 'Amount must be a number greater than 0.';
  }

  return errors;
}

export function NewTransferModal({
  isOpen,
  onClose,
  onTransferCompleted,
  initialAmount = '10,000',
  initialCurrency = 'USD',
}) {
  const [step, setStep] = useState(1);

  // Form State Step 1
  const [recipientName, setRecipientName] = useState('Amsterdam Commodities BV');
  const [country, setCountry] = useState('Netherlands (NL)');
  const [bankName, setBankName] = useState('ING Bank NV');
  const [accountNumber, setAccountNumber] = useState('NL91INGB0001234567');
  const [currency, setCurrency] = useState(initialCurrency);
  const [amount, setAmount] = useState(initialAmount);
  const [fieldErrors, setFieldErrors] = useState({});

  // Quote State Step 2
  const [rate, setRate] = useState(INITIAL_RATE);
  const [countdownSeconds, setCountdownSeconds] = useState(QUOTE_TTL_SECONDS);
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Simulation State Step 4
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [settlementIssue, setSettlementIssue] = useState(null);
  const [hasRetriedSettlement, setHasRetriedSettlement] = useState(false);

  const isQuoteExpired = countdownSeconds === 0;

  // Quote Timer Countdown: stops at 0 so an expired quote must be refreshed, never silently renewed.
  useEffect(() => {
    if (!isOpen || step !== 2 || isQuoteExpired) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step, isQuoteExpired]);

  // Automated State Progression Simulation
  useEffect(() => {
    if (step !== 4 || !isSimulating || settlementIssue) return;
    if (currentStatusIndex >= LIFECYCLE_STEPS.length - 1) return;

    const timer = setTimeout(() => {
      const next = currentStatusIndex + 1;
      const issueAtNext = Object.keys(SETTLEMENT_ISSUES).find((code) => SETTLEMENT_ISSUES[code].stepIndex === next);
      setCurrentStatusIndex(next);
      // A retried settlement is allowed to complete so a demo never loops on failure.
      if (issueAtNext && !hasRetriedSettlement && Math.random() < SIMULATED_FAILURE_RATE) {
        setSettlementIssue(issueAtNext);
        setIsSimulating(false);
      } else if (next >= LIFECYCLE_STEPS.length - 1) {
        setIsSimulating(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [step, currentStatusIndex, isSimulating, settlementIssue, hasRetriedSettlement]);

  if (!isOpen) return null;

  const numAmount = parseAmount(amount) || 0;
  const fee = 25;
  const recipientAmountNgn = numAmount * rate;
  const sendCurrencyCode = currency.trim().toUpperCase() || 'USD';
  const formattedRate = rate.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const activeIssue = settlementIssue ? SETTLEMENT_ISSUES[settlementIssue] : null;
  const isCompleted = currentStatusIndex === LIFECYCLE_STEPS.length - 1;

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleContinueToQuote = () => {
    const errors = validateDetails({ recipientName, accountNumber, amount });
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setStep(2);
  };

  const handleRefreshQuote = async () => {
    setIsRefreshingQuote(true);
    setQuoteError(null);
    try {
      const fresh = await api.quote.getIndicativeRate(sendCurrencyCode, 'NGN');
      setRate(fresh.rate);
      setCountdownSeconds(QUOTE_TTL_SECONDS);
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : 'We could not refresh the rate. Please try again.');
    } finally {
      setIsRefreshingQuote(false);
    }
  };

  const handleStartSimulation = () => {
    setStep(4);
    setCurrentStatusIndex(0);
    setSettlementIssue(null);
    setHasRetriedSettlement(false);
    setIsSimulating(true);
  };

  const handleSimulateIssue = (code) => {
    setCurrentStatusIndex(SETTLEMENT_ISSUES[code].stepIndex);
    setSettlementIssue(code);
    setIsSimulating(false);
  };

  const handleRetrySettlement = () => {
    setSettlementIssue(null);
    setHasRetriedSettlement(true);
    setIsSimulating(true);
  };

  const resetFlow = () => {
    setStep(1);
    setFieldErrors({});
    setCountdownSeconds(QUOTE_TTL_SECONDS);
    setQuoteError(null);
    setCurrentStatusIndex(0);
    setIsSimulating(false);
    setSettlementIssue(null);
    setHasRetriedSettlement(false);
  };

  const handleCloseAfterHold = () => {
    onClose();
    resetFlow();
  };

  const handleFinish = () => {
    const randomRefNum = Math.floor(8845 + Math.random() * 1000);
    const newRecord = {
      reference: `TXN-${randomRefNum}`,
      beneficiary: recipientName || 'Beneficiary Ltd',
      amount: `$${numAmount.toLocaleString('en-US')}`,
      currency: currency,
      status: 'Completed',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    onTransferCompleted(newRecord);
    onClose();
    resetFlow();
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-6 bg-black/75 backdrop-blur-sm animate-fadeIn sm:items-center">
      <div
        className="flex w-full max-w-2xl max-h-full flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sheet)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
              Cross-Border Payment Engine
            </span>
            <span className="text-xs text-neutral-400">· Step {step} of 4</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {/* STEP 1: RECIPIENT */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 1 — Recipient & Transfer Details</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Enter beneficiary payment destination and amount
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Recipient / Company Name"
                  value={recipientName}
                  error={fieldErrors.recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    clearFieldError('recipientName');
                  }}
                  placeholder="e.g. Amsterdam Commodities BV"
                />
                <TextField
                  label="Country of Destination"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Netherlands (NL)"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Beneficiary Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. ING Bank NV"
                />
                <TextField
                  label="Account / IBAN Number"
                  value={accountNumber}
                  error={fieldErrors.accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    clearFieldError('accountNumber');
                  }}
                  placeholder="e.g. NL91INGB0001234567"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Transfer Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="USD"
                />
                <TextField
                  label="Send Amount ($)"
                  value={amount}
                  inputMode="decimal"
                  error={fieldErrors.amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    clearFieldError('amount');
                  }}
                  placeholder="10,000"
                />
              </div>

              <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Button type="button" className="px-8" onClick={handleContinueToQuote}>
                  Continue <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: QUOTE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 2 — Lock In Firm FX Quote</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Review locked exchange rate and guaranteed landed payout
                  </p>
                </div>
                <Badge tone="info">Live Rate Lock</Badge>
              </div>

              <div className="rounded-xl border p-5 space-y-4" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Source Transfer Amount:</span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>${numAmount.toLocaleString()} USD</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Guaranteed FX Rate:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--color-brand-400)' }}>1 {sendCurrencyCode} = ₦{formattedRate} NGN</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Fixed Transfer Fee:</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>${fee}.00 USD</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between text-base" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>Beneficiary Payout (NGN):</span>
                  <span className="font-extrabold text-emerald-400 text-lg">
                    ₦{recipientAmountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div
                className={`flex items-center justify-between rounded-xl border p-4 text-xs ${
                  isQuoteExpired ? '' : 'bg-brand-500/10 border-brand-500/20'
                }`}
                style={isQuoteExpired ? { borderColor: 'var(--color-warning)' } : undefined}
              >
                <div
                  className="flex items-center gap-2 font-semibold"
                  style={{ color: isQuoteExpired ? 'var(--color-warning)' : 'var(--color-brand-400)' }}
                >
                  <ClockIcon size={16} />
                  Quote Expiry Countdown:
                </div>
                <span
                  className="font-mono text-sm font-extrabold"
                  style={{ color: isQuoteExpired ? 'var(--color-warning)' : 'var(--color-text-primary)' }}
                >
                  {formatTimer(countdownSeconds)}
                </span>
              </div>

              {isQuoteExpired && (
                <div
                  className="flex flex-col gap-3 rounded-xl px-4 py-3 text-sm sm:flex-row sm:items-center"
                  style={{ background: 'var(--color-warning)', color: 'var(--color-on-warning)' }}
                  role="alert"
                >
                  <div className="flex flex-1 items-start gap-2.5">
                    <ExclamationTriangleIcon size={18} />
                    <div>
                      <p className="font-medium">
                        This FX quote has expired. Currency rates fluctuate in real time. Please refresh the rate to continue.
                      </p>
                      {quoteError && <p className="mt-1 text-xs">{quoteError}</p>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="shrink-0"
                    style={{ background: 'var(--color-on-warning)', color: 'var(--color-warning)' }}
                    onClick={handleRefreshQuote}
                    disabled={isRefreshingQuote}
                  >
                    {isRefreshingQuote ? <SpinnerIcon size={14} /> : null}
                    {isRefreshingQuote ? 'Refreshing...' : 'Refresh Quote'}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Back to recipient
                </button>
                <Button type="button" className="px-8" onClick={() => setStep(3)} disabled={isQuoteExpired}>
                  Accept quote <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 3 — Review & Confirm Transfer</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Verify final details before triggering automated settlement
                </p>
              </div>

              <div className="rounded-xl border p-5 space-y-3.5 text-sm" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-neutral-400">Beneficiary:</span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{recipientName}</span>
                </div>
                <div className="flex justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-neutral-400">Bank & IBAN:</span>
                  <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{bankName} · {accountNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-neutral-400">Sending Amount:</span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>${numAmount.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-neutral-400">FX Locked Rate:</span>
                  <span className="font-mono" style={{ color: 'var(--color-brand-400)' }}>1 {sendCurrencyCode} = ₦{formattedRate} NGN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Net Recipient Receives:</span>
                  <span className="font-extrabold text-emerald-400">
                    ₦{recipientAmountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Linked Trade Documentation Indicator */}
              <div className="flex items-center justify-between rounded-xl border p-4 text-xs" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-2.5">
                  <DocumentCheckIcon size={18} color="var(--color-brand-400)" />
                  <div>
                    <span className="font-bold block" style={{ color: 'var(--color-text-primary)' }}>Trade Document Attached</span>
                    <span className="text-neutral-400 text-[11px]">Invoice #INV-8845 · Commercial Goods Import</span>
                  </div>
                </div>
                <Badge tone="success">Verified</Badge>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Back to quote
                </button>
                <Button type="button" className="px-8 font-extrabold" onClick={handleStartSimulation}>
                  Confirm transfer <ArrowRightIcon size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: STATUS & SIMULATION */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Step 4 — Live Payment Lifecycle Tracking</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    Real-time state machine progression across banking rails
                  </p>
                </div>
                <Badge tone={activeIssue ? activeIssue.tone : isCompleted ? 'success' : 'info'}>
                  {activeIssue ? activeIssue.badge : isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                </Badge>
              </div>

              {activeIssue && (
                <div
                  className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: `var(--color-${activeIssue.tone})`,
                    color: `var(--color-on-${activeIssue.tone})`,
                  }}
                  role="alert"
                >
                  <ExclamationTriangleIcon size={18} />
                  <div>
                    <p className="font-bold">{activeIssue.title}</p>
                    <p className="mt-1 text-xs">{activeIssue.message}</p>
                  </div>
                </div>
              )}

              {/* State Machine Step Progression List */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {LIFECYCLE_STEPS.map((item, idx) => {
                  const isPassed = idx < currentStatusIndex;
                  const isFailed = Boolean(activeIssue) && idx === currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex && !isFailed;
                  const issueColor = activeIssue ? `var(--color-${activeIssue.tone})` : undefined;

                  return (
                    <div
                      key={item.state}
                      className="flex items-center justify-between rounded-xl border p-3.5 transition-all"
                      style={{
                        backgroundColor: isFailed
                          ? 'var(--color-surface-2)'
                          : isCurrent
                          ? 'var(--color-surface-2)'
                          : isPassed
                          ? 'rgba(34, 197, 94, 0.06)'
                          : 'var(--color-canvas)',
                        borderColor: isFailed
                          ? issueColor
                          : isCurrent
                          ? 'var(--color-brand-600)'
                          : isPassed
                          ? 'rgba(34, 197, 94, 0.3)'
                          : 'var(--color-border-subtle)',
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: isFailed
                              ? issueColor
                              : isPassed
                              ? 'rgba(34, 197, 94, 0.2)'
                              : isCurrent
                              ? 'var(--color-brand-600)'
                              : 'var(--color-surface-2)',
                            color: isFailed
                              ? `var(--color-on-${activeIssue.tone})`
                              : isPassed
                              ? 'var(--color-success)'
                              : isCurrent
                              ? 'white'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {isFailed ? (
                            <ExclamationTriangleIcon size={14} />
                          ) : isPassed ? (
                            <CheckCircleIcon size={14} color="var(--color-success)" />
                          ) : isCurrent ? (
                            <SpinnerIcon size={14} color="white" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                            {item.label}
                            {isCurrent && (
                              <span className="text-[10px] text-brand-500 font-normal animate-pulse">
                                Processing...
                              </span>
                            )}
                            {isFailed && (
                              <span className="text-[10px] font-semibold" style={{ color: issueColor }}>
                                {activeIssue.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                        </div>
                      </div>

                      {isPassed && <span className="text-[11px] font-semibold text-emerald-400">Done</span>}
                    </div>
                  );
                })}
              </div>

              {/* Presenter Controls / Finish */}
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-2">
                  <ShieldIcon size={14} color="var(--color-brand-400)" />
                  <span className="text-xs text-neutral-400">Double-entry ledger audit active</span>
                </div>

                {settlementIssue === 'COMPLIANCE_HOLD' ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCloseAfterHold}
                      className="text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Close
                    </button>
                    <a
                      href={`mailto:${COMPLIANCE_DESK_EMAIL}?subject=${encodeURIComponent(`Compliance hold: transfer to ${recipientName}`)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold"
                      style={{ background: 'var(--color-brand-600)', color: 'var(--color-text-on-brand)' }}
                    >
                      Contact Compliance Desk <ArrowRightIcon size={16} />
                    </a>
                  </div>
                ) : settlementIssue === 'PAYOUT_DELAYED' ? (
                  <Button type="button" className="px-8 font-bold" onClick={handleRetrySettlement}>
                    Retry Settlement <ArrowRightIcon size={16} />
                  </Button>
                ) : !isCompleted ? (
                  <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
                    {currentStatusIndex <= SCREENED_INDEX && (
                      <button
                        type="button"
                        onClick={() => handleSimulateIssue('COMPLIANCE_HOLD')}
                        className="text-xs font-medium underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Simulate compliance hold
                      </button>
                    )}
                    {currentStatusIndex <= PAYING_OUT_INDEX && !hasRetriedSettlement && (
                      <button
                        type="button"
                        onClick={() => handleSimulateIssue('PAYOUT_DELAYED')}
                        className="text-xs font-medium underline"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Simulate payout delay
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentStatusIndex((prev) => Math.min(prev + 1, LIFECYCLE_STEPS.length - 1))}
                      className="text-xs font-bold text-brand-500 hover:text-brand-400 underline"
                    >
                      Advance state manually
                    </button>
                  </div>
                ) : (
                  <Button type="button" className="px-8 font-bold" onClick={handleFinish}>
                    Done · View in Dashboard <ArrowRightIcon size={16} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
