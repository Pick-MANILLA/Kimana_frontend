'use client';

import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { CheckCircleIcon, ShieldIcon } from '../../../components/ui/icons';

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
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);

  return (
    <section id="payment-certainty" className="py-28 border-t border-b relative" style={{ borderColor: 'var(--color-border-subtle)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Editorial Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            SECTION A · END-TO-END VISIBILITY
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
            Know where your money is.
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Uncertainty kills business momentum. Kimana gives you complete transparency at every stage of the transfer lifecycle, eliminating black-box delays and unexpected fee deductions.
          </p>
        </div>

        {/* Visual Transfer Timeline Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Timeline Steps Navigation Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {STAGES.map((stage) => {
              const isSelected = selectedStage.id === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setSelectedStage(stage)}
                  className="flex items-center justify-between rounded-xl border p-4 text-left transition-all hover:border-brand-500/50"
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
                </button>
              );
            })}
          </div>

          {/* Stage Details Display */}
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl border p-6 sm:p-8"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-brand-400)' }}>
                    Stage {selectedStage.stepNumber}
                  </span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {selectedStage.title} State
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircleIcon size={14} color="var(--color-success)" /> Verified Lifecycle State
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
                    className="rounded-xl border p-3.5"
                    style={{
                      backgroundColor: 'var(--color-canvas)',
                      borderColor: 'var(--color-border-subtle)',
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
    </section>
  );
}
