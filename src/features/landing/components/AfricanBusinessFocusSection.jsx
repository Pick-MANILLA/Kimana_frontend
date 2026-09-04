import { ArrowUpRightIcon, ShieldIcon } from '../../../components/ui/icons';

export function AfricanBusinessFocusSection() {
  return (
    <section id="solutions" className="py-28 border-b relative overflow-hidden" style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-canvas)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-brand-400)' }}>
            ENGINEERED FOR AFRICAN COMMERCE
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            Cross-border trade shouldn’t stall on financial friction.
          </h2>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            African businesses increasingly trade across borders, but payment uncertainty, FX complexity, documentation, and reconciliation create friction. Kimana brings these workflows into one business-focused experience.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            className="rounded-2xl border p-8 flex flex-col justify-between transition-all hover:border-brand-500/50"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
                01. FX Transparency
              </div>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Eliminate Hidden FX Margins
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                No post-trade rate markups or hidden bank deductions. Lock in your exact exchange quote before committing funds.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldIcon size={16} color="var(--color-success)" /> 100% Rate Lock Protection
            </div>
          </div>

          <div
            className="rounded-2xl border p-8 flex flex-col justify-between transition-all hover:border-brand-500/50"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
                02. Milestone Tracking
              </div>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                End Black-Box Transfers
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Real-time visibility across local deposits, currency conversion, compliance screening, and correspondent payout.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
              <ArrowUpRightIcon size={16} color="var(--color-brand-400)" /> Live State Machine Audit
            </div>
          </div>

          <div
            className="rounded-2xl border p-8 flex flex-col justify-between transition-all hover:border-brand-500/50"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
                03. Trade Reconciliation
              </div>
              <h3 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Business-Ready Records
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Attach trade invoices, bills of lading, and customs Form M directly to immutable payment settlement logs.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldIcon size={16} color="var(--color-success)" /> Tax & Audit Compliant
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
