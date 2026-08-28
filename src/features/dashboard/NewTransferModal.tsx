import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ShieldIcon,
  SpinnerIcon,
  XIcon,
} from '../../components/ui/icons';

export interface CompletedDemoTransfer {
  reference: string;
  beneficiary: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
}

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCompleted: (transfer: CompletedDemoTransfer) => void;
  initialAmount?: string;
  initialCurrency?: string;
}

type Step = 1 | 2 | 3 | 4;

type TransferStatusState =
  | 'CREATED'
  | 'QUOTED'
  | 'SCREENED'
  | 'FUNDED'
  | 'SETTLING'
  | 'PAYING_OUT'
  | 'COMPLETED';

const LIFECYCLE_STEPS: readonly { state: TransferStatusState; label: string; desc: string }[] = [
  { state: 'CREATED', label: '1. Created', desc: 'Transfer order registered in Kimana ledger.' },
  { state: 'QUOTED', label: '2. Quoted', desc: 'FX rate locked at 1 USD = ₦1,645.00.' },
  { state: 'SCREENED', label: '3. Screened', desc: 'Automated Sanctions & NIBSS KYB check cleared.' },
  { state: 'FUNDED', label: '4. Funded', desc: 'Local NIP payment received & verified.' },
  { state: 'SETTLING', label: '5. Settling', desc: 'Automated double-entry currency conversion in progress.' },
  { state: 'PAYING_OUT', label: '6. Paying Out', desc: 'Correspondent bank dispatch to beneficiary.' },
  { state: 'COMPLETED', label: '7. Completed', desc: 'Beneficiary account credited & audit receipt generated.' },
];

export function NewTransferModal({
  isOpen,
  onClose,
  onTransferCompleted,
  initialAmount = '10,000',
  initialCurrency = 'USD',
}: NewTransferModalProps) {
  const [step, setStep] = useState<Step>(1);

  // Form State Step 1
  const [recipientName, setRecipientName] = useState('Amsterdam Commodities BV');
  const [country, setCountry] = useState('Netherlands (NL)');
  const [bankName, setBankName] = useState('ING Bank NV');
  const [accountNumber, setAccountNumber] = useState('NL91INGB0001234567');
  const [currency, setCurrency] = useState(initialCurrency);
  const [amount, setAmount] = useState(initialAmount);

  // Simulation State Step 4
  const [currentStatusIndex, setCurrentStatusIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(114);

  // Quote Timer Countdown
  useEffect(() => {
    if (!isOpen || step !== 2) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step]);

  // Automated State Progression Simulation
  useEffect(() => {
    if (step !== 4 || !isSimulating) return;

    if (currentStatusIndex < LIFECYCLE_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStatusIndex((prev) => {
          const next = prev + 1;
          if (next >= LIFECYCLE_STEPS.length - 1) {
            setIsSimulating(false);
          }
          return next;
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, currentStatusIndex, isSimulating]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const rate = 1645;
  const fee = 25;
  const recipientAmountNgn = numAmount * rate;

  const handleStartSimulation = () => {
    setStep(4);
    setCurrentStatusIndex(0);
    setIsSimulating(true);
  };

  const handleFinish = () => {
    const randomRefNum = Math.floor(8845 + Math.random() * 1000);
    const newRecord: CompletedDemoTransfer = {
      reference: `TXN-${randomRefNum}`,
      beneficiary: recipientName || 'Beneficiary Ltd',
      amount: `$${numAmount.toLocaleString('en-US')}`,
      currency: currency,
      status: 'Completed',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    onTransferCompleted(newRecord);
    onClose();
    // Reset state for next launch
    setStep(1);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl transition-all"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sheet)',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
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
        <div className="p-6 sm:p-8">
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
                  onChange={(e) => setRecipientName(e.target.value)}
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
                  onChange={(e) => setAccountNumber(e.target.value)}
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
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10,000"
                />
              </div>

              <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <Button type="button" className="px-8" onClick={() => setStep(2)}>
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
                  <span className="font-mono font-bold" style={{ color: 'var(--color-brand-400)' }}>1 USD = ₦1,645.00 NGN</span>
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

              <div className="flex items-center justify-between rounded-xl border p-4 bg-brand-500/10 border-brand-500/20 text-xs">
                <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--color-brand-400)' }}>
                  <ClockIcon size={16} />
                  Quote Expiry Countdown:
                </div>
                <span className="font-mono text-sm font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                  {formatTimer(countdownSeconds)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Back to recipient
                </button>
                <Button type="button" className="px-8" onClick={() => setStep(3)}>
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
                  <span className="font-mono" style={{ color: 'var(--color-brand-400)' }}>1 USD = ₦1,645.00 NGN</span>
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
                <Badge tone={currentStatusIndex === LIFECYCLE_STEPS.length - 1 ? 'success' : 'info'}>
                  {currentStatusIndex === LIFECYCLE_STEPS.length - 1 ? 'COMPLETED' : 'IN PROGRESS'}
                </Badge>
              </div>

              {/* State Machine Step Progression List */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {LIFECYCLE_STEPS.map((item, idx) => {
                  const isPassed = idx < currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div
                      key={item.state}
                      className="flex items-center justify-between rounded-xl border p-3.5 transition-all"
                      style={{
                        backgroundColor: isCurrent
                          ? 'var(--color-surface-2)'
                          : isPassed
                          ? 'rgba(34, 197, 94, 0.06)'
                          : 'var(--color-canvas)',
                        borderColor: isCurrent
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
                            backgroundColor: isPassed
                              ? 'rgba(34, 197, 94, 0.2)'
                              : isCurrent
                              ? 'var(--color-brand-600)'
                              : 'var(--color-surface-2)',
                            color: isPassed
                              ? 'var(--color-success)'
                              : isCurrent
                              ? 'white'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {isPassed ? (
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

                {currentStatusIndex < LIFECYCLE_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStatusIndex((prev) => Math.min(prev + 1, LIFECYCLE_STEPS.length - 1))}
                    className="text-xs font-bold text-brand-500 hover:text-brand-400 underline"
                  >
                    Advance state manually
                  </button>
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
