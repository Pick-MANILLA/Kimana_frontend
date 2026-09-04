import { Badge } from '../../../components/ui/Badge';
import {
  CheckCircleIcon,
  DocumentCheckIcon,
  DownloadIcon,
  ShieldIcon,
} from '../../../components/ui/icons';

export function DocumentsReconciliationSection() {
  return (
    <section className="py-28 border-t relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            SECTION B · COMPLIANCE & RECONCILIATION
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--color-text-primary)' }}>
            Every payment leaves a record.
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Kimana automatically binds trade documents, customs forms, and commercial invoices directly to immutable settlement logs, ensuring 100% audit compliance and seamless ERP reconciliation.
          </p>
        </div>

        {/* Detailed Payment Record Card Visual */}
        <div className="mt-16 rounded-2xl border p-6 sm:p-8 shadow-xl" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-neutral-400">Reference: TRX-2026-9041</span>
                <Badge tone="success">Settled & Reconciled</Badge>
              </div>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--color-text-primary)' }}>
                Apex Trade Co · Commercial Equipment Import
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                Audit Hash: 0x94f8e1...38b1
              </span>
            </div>
          </div>

          {/* Payment Record Grid Breakdown */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 border-b pb-6" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Transaction</span>
              <span className="text-xs font-bold mt-1 block" style={{ color: 'var(--color-text-primary)' }}>Cross-Border FX</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Amount</span>
              <span className="text-xs font-bold mt-1 block" style={{ color: 'var(--color-text-primary)' }}>$10,000.00 USD</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">FX Rate</span>
              <span className="text-xs font-bold mt-1 block" style={{ color: 'var(--color-text-primary)' }}>₦1,485.00 / USD</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Recipient</span>
              <span className="text-xs font-bold mt-1 block truncate" style={{ color: 'var(--color-text-primary)' }}>Adunola Global</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Reference</span>
              <span className="text-xs font-bold mt-1 block" style={{ color: 'var(--color-brand-400)' }}>KMN-9041</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Documents</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">3 Attached</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Status</span>
              <span className="text-xs font-bold text-emerald-400 mt-1 block">Completed</span>
            </div>
            <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--color-canvas)', borderColor: 'var(--color-border-subtle)' }}>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase block">Reconciliation</span>
              <span className="text-xs font-bold mt-1 block" style={{ color: 'var(--color-text-primary)' }}>100% Matched</span>
            </div>
          </div>

          {/* Documents & ERP Export Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
            {/* Left 6 Cols: Attached Documents */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Attached Trade Compliance Files
              </span>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between rounded-xl border p-3" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <DocumentCheckIcon size={18} color="var(--color-brand-400)" />
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Commercial Invoice #INV-2026-9041.pdf</span>
                  </div>
                  <CheckCircleIcon size={16} color="var(--color-success)" />
                </div>
                <div className="flex items-center justify-between rounded-xl border p-3" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <DocumentCheckIcon size={18} color="var(--color-brand-400)" />
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Bill of Lading #BOL-8491-GH.pdf</span>
                  </div>
                  <CheckCircleIcon size={16} color="var(--color-success)" />
                </div>
              </div>
            </div>

            {/* Right 6 Cols: 1-Click Reconciliation Exports */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Automated Reconciliation Formats
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 rounded-xl border p-3 text-center transition-colors cursor-pointer hover:border-brand-500/50" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-xs font-bold flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <DownloadIcon size={14} /> Export CSV
                  </span>
                </div>
                <div className="flex-1 rounded-xl border p-3 text-center transition-colors cursor-pointer hover:border-brand-500/50" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-xs font-bold flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <DownloadIcon size={14} /> Export MT940
                  </span>
                </div>
                <div className="flex-1 rounded-xl border p-3 text-center transition-colors cursor-pointer hover:border-brand-500/50" style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}>
                  <span className="text-xs font-bold flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    <ShieldIcon size={14} color="var(--color-brand-400)" /> PDF Audit Packet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
