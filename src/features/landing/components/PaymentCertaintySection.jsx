'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircleIcon, ShieldIcon } from '../../../components/ui/icons';
import './PaymentCertaintySection.css';

// How long each stage stays selected before auto-advancing. The timing is
// driven by the CSS progress bar (its `animationend` advances the stage), so
// pausing the bar pauses the carousel too. Keep in sync with --pc-dwell.
const DWELL_MS = 6000;

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(onChange) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

const STAGES = [
  {
    id: 'quote',
    stepNumber: '01',
    title: 'QUOTE',
    shortDesc: 'Guaranteed rate lock',
    fullDesc: 'Lock in mid-market FX rates with zero hidden spread or surprise fees before committing funds.',
    statusBadge: 'info',
    timeEstimate: 'Instant (2-min lock)',
    details: [
      { label: 'Rate Guarantee', value: '1 USD = 1,485.00 NGN' },
      { label: 'Fee Transparency', value: 'Fixed 0.15% processing' },
      { label: 'Quote Expiry', value: '120 seconds countdown' },
    ],
  },
  {
    id: 'screened',
    stepNumber: '02',
    title: 'SCREENED',
    shortDesc: 'Automated compliance check',
    fullDesc: 'Real-time screening against OFAC SDN, NIBSS director database, and local CBN compliance rules.',
    statusBadge: 'info',
    timeEstimate: '< 10 seconds',
    details: [
      { label: 'Sanctions Check', value: 'Passed (OFAC & EU)' },
      { label: 'PEP Screening', value: 'Cleared' },
      { label: 'Risk Rating', value: 'Low Risk Tier 3' },
    ],
  },
  {
    id: 'funded',
    stepNumber: '03',
    title: 'FUNDED',
    shortDesc: 'Local currency deposit',
    fullDesc: 'Deposit funds instantly via local bank transfer (NIP) or dedicated Kimana virtual account.',
    statusBadge: 'info',
    timeEstimate: '< 60 seconds',
    details: [
      { label: 'Funding Method', value: 'NIP Instant Transfer' },
      { label: 'Deposit Ref', value: 'KMN-FND-9481' },
      { label: 'Account Match', value: 'Verified Company Name' },
    ],
  },
  {
    id: 'settling',
    stepNumber: '04',
    title: 'SETTLING',
    shortDesc: 'Instant conversion',
    fullDesc: 'Kimana automated FX engine converts currency at the locked quote rate with full double-entry ledger records.',
    statusBadge: 'info',
    timeEstimate: 'Real-time',
    details: [
      { label: 'Conversion Pair', value: 'NGN → USD' },
      { label: 'Spread Margin', value: '0.00% Guaranteed' },
      { label: 'Ledger Audit Hash', value: '0x8f2a...94e1' },
    ],
  },
  {
    id: 'paying_out',
    stepNumber: '05',
    title: 'PAYING OUT',
    shortDesc: 'Correspondent routing',
    fullDesc: 'Funds are dispatched across correspondent banking rails directly to beneficiary account.',
    statusBadge: 'info',
    timeEstimate: '1 – 3 minutes',
    details: [
      { label: 'Beneficiary Bank', value: 'Guaranty Trust Bank' },
      { label: 'Account Number', value: '•••• •••• 1029' },
      { label: 'Routing Mechanism', value: 'Direct SWIFT / NIP' },
    ],
  },
  {
    id: 'completed',
    stepNumber: '06',
    title: 'COMPLETED',
    shortDesc: 'Verified payment record',
    fullDesc: 'Beneficiary account credited and tax-compliant transaction proof generated automatically.',
    statusBadge: 'success',
    timeEstimate: 'Complete',
    details: [
      { label: 'Receipt Document', value: 'PDF Proof of Payment' },
      { label: 'Reconciliation ID', value: 'REC-2026-884' },
      { label: 'ERP Sync', value: 'QuickBooks / Xero Ready' },
    ],
  },
];

export function PaymentCertaintySection() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const selectedStage = STAGES[index];

  // Only cycle while the section is actually on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const autoplay = !reducedMotion;
  const running = autoplay && inView && !hovered && !focused;
  const advance = () => setIndex((i) => (i + 1) % STAGES.length);

  return (
    <section
      ref={sectionRef}
      id="payment-certainty"
      className="py-28 border-t border-b relative"
      style={{ borderColor: 'var(--color-border-subtle)', '--pc-dwell': `${DWELL_MS}ms` }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Editorial Section Header */}
        <div data-reveal className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            END-TO-END VISIBILITY
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
            Know where your money is.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Uncertainty kills business momentum. Kimana gives you complete transparency at every stage of the transfer lifecycle, eliminating black-box delays and unexpected fee deductions.
          </p>
        </div>

        {/* Visual Transfer Timeline Grid */}
        <div
          className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
          }}
        >
          {/* Timeline Steps Navigation Sidebar */}
          <div data-reveal="left" className="lg:col-span-5 flex flex-col gap-3">
            {STAGES.map((stage, i) => {
              const isSelected = i === index;
              return (
                <button
                  key={stage.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setIndex(i)}
                  className="pc-stage relative overflow-hidden flex items-center justify-between rounded-xl border p-4 text-left hover:border-brand-500/50"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
                    borderColor: isSelected ? 'var(--color-brand-600)' : 'var(--color-border-subtle)',
                    transform: isSelected ? 'translateX(4px)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      style={{
                        backgroundColor: isSelected ? 'var(--color-brand-600)' : 'var(--color-canvas)',
                        color: isSelected ? 'var(--color-text-on-brand)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {stage.stepNumber}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                        {stage.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {stage.shortDesc}
                      </div>
                    </div>
                  </div>

                  <Badge tone={stage.statusBadge}>
                    {stage.timeEstimate}
                  </Badge>

                  {/* Dwell progress: when it finishes, the next stage is selected. */}
                  {isSelected && autoplay ? (
                    <span
                      key={`progress-${index}`}
                      className="pc-progress"
                      aria-hidden="true"
                      style={{ animationPlayState: running ? 'running' : 'paused' }}
                      onAnimationEnd={advance}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Stage Details Display */}
          <div data-reveal="right" className="lg:col-span-7" style={{ '--rv-i': 1 }}>
            <div
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              {/* Re-keyed per stage so the enter transition replays on every switch */}
              <div key={selectedStage.id} className="pc-panel">
              <div className="flex flex-col items-start gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-brand-400)' }}>
                    Stage {selectedStage.stepNumber}
                  </span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStage.title} State
                  </h3>
                </div>
                <div className="k-chip shrink-0">
                  <CheckCircleIcon size={14} color="currentColor" /> Verified Lifecycle State
                </div>
              </div>

              <p className="mt-5 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {selectedStage.fullDesc}
              </p>

              {/* Stage Parameter Grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedStage.details.map((detail, idx) => (
                  <div
                    key={idx}
                    className="pc-card rounded-xl border p-3.5"
                    style={{
                      backgroundColor: 'var(--color-canvas)',
                      borderColor: 'var(--color-border-subtle)',
                      '--pc-i': idx,
                    }}
                  >
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {detail.label}
                    </span>
                    <div className="mt-1 text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {detail.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Audit Log Box */}
              <div className="mt-6 rounded-xl border p-4" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <ShieldIcon size={14} color="var(--color-brand-400)" /> Continuous State Machine Monitoring
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    State ID: {selectedStage.id.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-xs leading-normal" style={{ color: 'var(--color-text-secondary)' }}>
                  State changes are validated across dual-entry accounting ledgers to prevent unverified fund movements or hanging transactions.
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
