import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
} from '../../../components/ui/icons';

export function HeroProductPreview() {
  const [usdInput, setUsdInput] = useState('10,000');
  const ngnEquivalent = (parseFloat(usdInput.replace(/,/g, '')) || 0) * 1485;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border shadow-2xl transition-all"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderColor: 'var(--color-border-subtle)',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      {/* Product Window Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4"
        style={{
          backgroundColor: 'var(--color-surface-2)',
          borderColor: 'var(--color-border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-neutral-400">
            Kimana Business Platform · Tier 3 Verified Account
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Rate Lock (1 USD = 1,485.00 NGN)
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-12">
        {/* Left 6 Cols: Available Balance & FX Quote */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Available Balances Card */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
              <span>Available Liquidity Balance</span>
              <Badge tone="info">Active Account</Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <span className="text-xs font-semibold text-neutral-400">Available NGN</span>
                <div className="mt-1 text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                  ₦12,450,000<span className="text-xs font-medium text-neutral-400">.00</span>
                </div>
              </div>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <span className="text-xs font-semibold text-neutral-400">Available USD</span>
                <div className="mt-1 text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                  $25,000<span className="text-xs font-medium text-neutral-400">.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Live FX Rate Quote Widget */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: 'var(--color-brand-500)' }}>
                Firm FX Quote Engine
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Lock window: 01:54
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {/* USD Send Box */}
              <div className="flex items-center justify-between rounded-xl border p-3.5" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-400 uppercase">You Send</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-base font-bold text-neutral-300">$</span>
                    <input
                      type="text"
                      value={usdInput}
                      onChange={(e) => setUsdInput(e.target.value)}
                      className="w-28 bg-transparent text-base font-extrabold focus:outline-none"
                      style={{ color: 'var(--color-text-primary)' }}
                    />
                  </div>
                </div>
                <Badge tone="info">USD</Badge>
              </div>

              {/* Rate Details */}
              <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
                <span>Indicative Rate: 1 USD = ₦1,485.00</span>
                <span className="text-emerald-400 font-semibold">0% Margin Markup</span>
              </div>

              {/* NGN Receive Box */}
              <div className="flex items-center justify-between rounded-xl border p-3.5" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-400 uppercase">Beneficiary Receives</span>
                  <span className="text-base font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                    ₦{ngnEquivalent.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Badge tone="success">NGN</Badge>
              </div>
            </div>

            {/* Recipient details */}
            <div className="mt-4 flex items-center justify-between border-t pt-3.5 text-xs" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2">
                <ShieldIcon size={16} color="var(--color-brand-500)" />
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Adunola Global Supplies Ltd</span>
              </div>
              <span className="text-neutral-400">Guaranty Trust Bank • 0129481029</span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Recent Transfer & Progress Tracker */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Active Transfer Tracker */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-neutral-400">
                  Ref: TRX-2026-10492
                </span>
                <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
                  Recent Transfer ($10,000 USD → NGN)
                </h3>
              </div>
              <Badge tone="info">SETTLING & PAYING OUT</Badge>
            </div>

            {/* Progress Timeline Bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-emerald-400">Quote</span>
                <span className="text-emerald-400">Screened</span>
                <span className="text-emerald-400">Funded</span>
                <span className="text-brand-500 animate-pulse">Settling</span>
                <span className="text-neutral-500">Completed</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-neutral-800">
                <div className="h-2 w-4/5 rounded-full transition-all duration-500" style={{ backgroundColor: 'var(--color-brand-600)' }} />
              </div>
            </div>

            {/* Settlement progress detail */}
            <div className="mt-4 rounded-xl border p-4" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Payout Rails:</span>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>NIBSS Instant Payment (NIP)</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Est. Completion:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ClockIcon size={14} /> ~30 seconds remaining
                </span>
              </div>
            </div>
          </div>

          {/* Pending Actions & Working Capital Preview */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
              <span>Pending Actions & Credit Potential</span>
              <button type="button" className="flex items-center gap-1 text-brand-500 hover:text-brand-400 font-bold">
                Details <ArrowUpRightIcon size={12} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircleIcon size={16} color="var(--color-success)" />
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Invoice Matching Complete</div>
                    <div className="text-[11px] text-neutral-400">Attached #INV-9041 verified</div>
                  </div>
                </div>
                <Badge tone="success">Verified</Badge>
              </div>

              <div className="flex items-center justify-between rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 font-bold text-xs">
                    WC
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Working Capital Signal</div>
                    <div className="text-[11px] text-neutral-400">Building verified trade history</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
